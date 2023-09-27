import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChainId } from 'common/enums';
import { runTransaction } from 'common/helpers/transaction.helper';
import { subMinutes } from 'date-fns';
import { DatabaseFunctionOptions, Optional } from 'src/common/interfaces';
import { LessThan, Not, QueryRunner, Repository } from 'typeorm';
import { TokenJobEntity } from './entities/tokens-jobs.entity';
import { TokenEntity } from './entities/tokens.entity';
import { TokenJobStatus, TokenJobType } from './enums';
import { TokensJobsService } from './tokens-jobs.service';
import { parallel, cluster } from 'radash';
import { ERC721Provider } from '../blockchain/evm/providers/ERC721.provider';
import { isString } from 'class-validator';

@Injectable()
export class TokensJobsFetchOwnerAddressService {
  logger = new Logger(TokensJobsFetchOwnerAddressService.name);

  constructor(
    @InjectRepository(TokenJobEntity)
    private readonly tokenJobRepository: Repository<TokenJobEntity>,
    @InjectRepository(TokenEntity)
    private readonly tokenRepository: Repository<TokenEntity>,
    private readonly tokensJobsService: TokensJobsService,
    private eRC721Provider: ERC721Provider,
  ) {}

  async execute(): Promise<void> {
    await runTransaction<void>(this.tokenJobRepository.manager, async (queryRunner) => {
      const job = await this.getNextJob(queryRunner);
      if (!job || !job.tokensIds?.length) {
        return Promise.resolve();
      }
      try {
        await this.tokenJobRepository.update(job.id, {
          status: TokenJobStatus.Started,
          startedAt: new Date(),
        });
        const contract = await this.eRC721Provider.create(job.address, job.chainId);
        await parallel(5, job.tokensIds, async (tokenId) => {
          const ownerAddress = await contract.getOwnerOf(tokenId);
          if (isString(ownerAddress)) {
            await this.updateOwnerAddressToken(
              {
                address: job.address,
                chainId: job.chainId,
                tokenId,
                ownerAddress,
              },
              { queryRunnerArg: queryRunner },
            );
          }
          await queryRunner.manager.update(
            TokenEntity,
            {
              address: job.address,
              chainId: job.chainId,
              tokenId,
            },
            {
              lastOwnerAddressCheckAt: new Date(),
            },
          );
        });
        await queryRunner.manager.update(TokenJobEntity, job.id, {
          status: TokenJobStatus.Completed,
          completeAt: new Date(),
        });
      } catch (error) {
        this.logger.error(error);
        await this.tokenJobRepository.update(job.id, {
          status: TokenJobStatus.Failed,
          failedAt: new Date(),
        });
        throw error;
      }
    });
  }

  async checkJobsHaveAlreadyStartedButNotFinished(): Promise<void> {
    await this.tokenJobRepository.update(
      {
        status: TokenJobStatus.Started,
        type: TokenJobType.FetchOwnerAddress,
        startedAt: LessThan(subMinutes(new Date(), 5)),
      },
      {
        status: TokenJobStatus.Created,
        executeAt: new Date(),
        startedAt: null,
      },
    );
  }

  async checkTokensOwnerAddressNotChangeForLongTime(): Promise<void> {
    const items: { address: string; chain_id: ChainId; tokens_ids: number[] }[] = await this.tokenRepository
      .query(`SELECT tokens.address, tokens.chain_id, json_agg(token_id) as tokens_ids
      FROM tokens
               LEFT OUTER JOIN tokens_jobs
                               on tokens.chain_id = tokens_jobs.chain_id AND tokens.address = tokens_jobs.address AND
                                  tokens.token_id::text = ANY (tokens_jobs.tokens_ids) AND
                                  tokens_jobs.status IN ('created', 'started') AND tokens_jobs.type = 'fetch_owner_address'
      WHERE tokens_jobs.id IS NULL
        AND (owner_address IS NULL OR
             (last_owner_address_check_at IS NOT NULL AND last_owner_address_check_at < NOW() - INTERVAL '1 hour'))
      GROUP BY tokens.address, tokens.chain_id
      LIMIT 10`);
    for await (const item of items) {
      parallel(10, cluster(item.tokens_ids, 10), async (tokensIds) => {
        await this.tokensJobsService.createJob({
          tokensIds: tokensIds.map(String),
          tokensUris: [],
          address: item.address,
          chainId: item.chain_id,
          type: TokenJobType.FetchOwnerAddress,
          executeAt: new Date(),
        });
      });
    }
  }

  private async getNextJob(queryRunner: QueryRunner): Promise<Optional<TokenJobEntity>> {
    return queryRunner.manager.findOne(TokenJobEntity, {
      where: {
        status: TokenJobStatus.Created,
        type: TokenJobType.FetchOwnerAddress,
        executeAt: LessThan(new Date()),
      },
      order: {
        executeAt: 'ASC',
      },
      lock: {
        mode: 'for_key_share',
        onLocked: 'skip_locked',
      },
    });
  }

  private updateOwnerAddressToken(
    params: { address: string; chainId: ChainId; tokenId: string; ownerAddress?: Optional<string> },
    opts?: DatabaseFunctionOptions,
  ) {
    return runTransaction<void>(
      this.tokenJobRepository.manager,
      async (queryRunner) => {
        await queryRunner.manager.update(
          TokenEntity,
          {
            address: params.address,
            chainId: params.chainId,
            tokenId: params.tokenId,
            ownerAddress: Not(params.ownerAddress?.toLowerCase()),
          },
          {
            ownerAddress: params.ownerAddress?.toLowerCase(),
            lastOwnerAddressChangeAt: new Date(),
          },
        );
      },
      opts?.queryRunnerArg,
    );
  }
}
