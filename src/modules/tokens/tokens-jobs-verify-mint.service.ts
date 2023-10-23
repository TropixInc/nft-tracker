import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChainId } from 'common/enums';
import { parallel } from 'radash';
import { runTransaction } from 'common/helpers/transaction.helper';
import { DatabaseFunctionOptions, Optional } from 'src/common/interfaces';
import { LessThan, QueryRunner, Repository } from 'typeorm';
import { differenceInMinutes, subMinutes } from 'date-fns';
import { ERC721Provider } from '../blockchain/evm/providers/ERC721.provider';
import { TokenJobEntity } from './entities/tokens-jobs.entity';
import { TokenEntity } from './entities/tokens.entity';
import { TokenJobStatus, TokenJobType } from './enums';

@Injectable()
export class TokensJobsVerifyMintService {
  logger = new Logger(TokensJobsVerifyMintService.name);

  constructor(
    @InjectRepository(TokenJobEntity)
    private tokenJobRepository: Repository<TokenJobEntity>,
    private eRC721Provider: ERC721Provider,
  ) {}
  async execute(): Promise<void> {
    return runTransaction<void>(this.tokenJobRepository.manager, async (queryRunner) => {
      const job = await this.getNextJob(queryRunner);
      if (!job) {
        return Promise.resolve();
      }
      this.logger.verbose(`Starting verify mint job ${job.tokensIds.join(',')}`);
      await this.tokenJobRepository.update(job.id, {
        status: TokenJobStatus.Started,
        startedAt: new Date(),
      });
      try {
        const countTokensFound = await this.verifyMintByTokensIds(
          {
            tokensIds: job.tokensIds,
            address: job.address!,
            chainId: job.chainId!,
          },
          { queryRunnerArg: queryRunner },
        );
        await queryRunner.manager.update(TokenJobEntity, job.id, {
          status: TokenJobStatus.Completed,
          completeAt: new Date(),
        });
        if (countTokensFound !== 0) {
          await queryRunner.manager.save(TokenJobEntity, {
            address: job.address,
            chainId: job.chainId,
            type: TokenJobType.VerifyMint,
            status: TokenJobStatus.Created,
            executeAt: new Date(),
            tokensIds: this.getNextSequentialFromTokensIds(job.tokensIds),
          });
          this.logger.verbose(`Finished verify mint job ${job.tokensIds.join(',')}`);
        }
        this.logger.debug(`Finished verify mint job ${job.tokensIds.join(',')} with ${countTokensFound} found`);
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
        type: TokenJobType.VerifyMint,
        startedAt: LessThan(subMinutes(new Date(), 5)),
      },
      {
        status: TokenJobStatus.Created,
        executeAt: new Date(),
        startedAt: null,
      },
    );
  }

  private getNextSequentialFromTokensIds(tokensIds: string[], numberOfItems = 10): string[] {
    const highestValue = Math.max(...tokensIds.map(Number));
    return Array.from({ length: numberOfItems }, (_, index) => highestValue + index + 1).map(String);
  }

  private async getNextJob(queryRunner: QueryRunner): Promise<Optional<TokenJobEntity>> {
    return queryRunner.manager.findOne(TokenJobEntity, {
      where: {
        status: TokenJobStatus.Created,
        type: TokenJobType.VerifyMint,
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

  async verifyMintByTokensIds(
    params: {
      tokensIds: string[];
      address: string;
      chainId: ChainId;
    },
    opts?: DatabaseFunctionOptions,
  ): Promise<number> {
    return runTransaction<number>(
      this.tokenJobRepository.manager,
      async (queryRunner) => {
        let countTokensFound = 0;
        const contract = await this.eRC721Provider.create(params.address, params.chainId);
        const baseUri = await contract.getBaseUri();
        await parallel(10, params.tokensIds, async (tokenId) => {
          try {
            this.logger.debug(`Get information of token ${params.address}/${params.chainId}/${tokenId}`);
            const uri = await contract.getTokenUri(tokenId);
            const tokenUri = contract.formatTokenUri(tokenId, baseUri, uri);
            this.logger.debug(`Token uri of token ${params.address}/${params.chainId}/${tokenId} is ${tokenUri}`);
            if (!tokenUri) {
              this.logger.error(`TokenUri is not valid for token ${params.address}/${params.chainId}/${tokenId}`);
              await Promise.resolve();
            } else {
              const ownerAddress = await contract.getOwnerOf(tokenId);
              await this.upsertToken(
                {
                  address: params.address,
                  chainId: params.chainId,
                  tokenId,
                  tokenUri,
                  ownerAddress,
                },
                { queryRunnerArg: queryRunner },
              );
              countTokensFound++;
            }
          } catch (error) {
            this.logger.error(`Error when get information of token ${params.address}/${params.chainId}/${tokenId}`);
            this.logger.error(error);
            throw error;
          }

          this.logger.debug(`Save token ${params.address}/${params.chainId}/${tokenId}`);
        });
        return countTokensFound;
      },
      opts?.queryRunnerArg,
    );
  }

  async resyncVerifyMint() {
    const items: { address: string; chain_id: ChainId; last_verify_at; token_id }[] = await this.tokenJobRepository
      .query(`SELECT address,
                    chain_id,
                    (SELECT tokens_jobs.created_at
                      FROM tokens_jobs
                      WHERE type = 'verify_mint'
                        AND contracts.address = tokens_jobs.address
                        AND contracts.chain_id = tokens_jobs.chain_id
                      ORDER BY created_at DESC
                      LIMIT 1) as last_verify_at,
                    (SELECT token_id
                      FROM tokens
                      WHERE contracts.address = tokens.address
                        AND contracts.chain_id = tokens.chain_id
                      ORDER BY token_id DESC
                      LIMIT 1) as token_id
              FROM contracts
              WHERE contracts.deleted_at IS NULL`);

    const contracts = items.filter(
      (contract) => differenceInMinutes(new Date(contract.last_verify_at), new Date()) >= 60, // one hour
    );
    for await (const contract of contracts) {
      await this.tokenJobRepository.save({
        address: contract.address,
        chainId: contract.chain_id,
        type: TokenJobType.VerifyMint,
        status: TokenJobStatus.Created,
        executeAt: new Date(),
        tokensIds: this.getNextSequentialFromTokensIds([contract.token_id]),
      });
    }
  }

  private upsertToken(
    params: { address: string; chainId: ChainId; tokenId: string; tokenUri: string; ownerAddress?: Optional<string> },
    opts?: DatabaseFunctionOptions,
  ) {
    return runTransaction<void>(
      this.tokenJobRepository.manager,
      async (queryRunner) => {
        this.logger.verbose(
          `Save token ${params.address}/${params.chainId}/${params.tokenId} with uri ${params.tokenUri}`,
        );
        await queryRunner.manager.upsert(
          TokenEntity,
          {
            address: params.address,
            chainId: params.chainId,
            tokenId: params.tokenId,
            tokenUri: params.tokenUri,
            ownerAddress: params.ownerAddress?.toLocaleLowerCase(),
            lastOwnerAddressChangeAt: new Date(),
            lastOwnerAddressCheckAt: new Date(),
          },
          ['address', 'chainId', 'tokenId'],
        );
        await queryRunner.manager.save(TokenJobEntity, {
          address: params.address,
          chainId: params.chainId,
          type: TokenJobType.FetchMetadata,
          status: TokenJobStatus.Created,
          executeAt: new Date(),
          tokensIds: [params.tokenId],
          tokensUris: [params.tokenUri],
        });
      },
      opts?.queryRunnerArg,
    );
  }
}
