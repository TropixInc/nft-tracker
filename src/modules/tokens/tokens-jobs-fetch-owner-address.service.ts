import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChainId } from 'common/enums';
import { subMinutes } from 'date-fns';
import { LessThan, Not, Repository } from 'typeorm';
import { TokenJobEntity } from './entities/tokens-jobs.entity';
import { TokenEntity } from './entities/tokens.entity';
import { TokenJobStatus, TokenJobType } from './enums';
import { TokensJobsService } from './tokens-jobs.service';
import { parallel, cluster } from 'radash';
import { ERC721Provider } from '../blockchain/evm/providers/ERC721.provider';
import { isString } from 'class-validator';
import { LocalQueueEnum, TokenJobJobs } from '../queue/enums';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

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
    @InjectQueue(LocalQueueEnum.TokenJob)
    private readonly queue: Queue,
  ) {}

  async execute(jobId: string): Promise<void> {
    const job = await this.tokenJobRepository.findOne({
      where: {
        id: jobId,
        status: TokenJobStatus.Created,
        executeAt: LessThan(new Date()),
      },
    });
    if (!job || !job.tokensIds?.length) {
      return Promise.resolve();
    }
    try {
      await this.tokenJobRepository.update(job.id, {
        status: TokenJobStatus.Started,
        startedAt: new Date(),
      });
      const contract = await this.eRC721Provider.create(job.address!, job.chainId!);
      await parallel(5, job.tokensIds, async (tokenId) => {
        const ownerAddress = await contract.getOwnerOf(tokenId);
        if (isString(ownerAddress)) {
          await this.tokenRepository.update(
            {
              address: job.address!,
              chainId: job.chainId!,
              tokenId,
              ownerAddress: Not(ownerAddress?.toLowerCase()),
            },
            {
              ownerAddress: ownerAddress?.toLowerCase(),
              lastOwnerAddressChangeAt: new Date(),
            },
          );
        }
        await this.tokenRepository.update(
          {
            address: job.address!,
            chainId: job.chainId!,
            tokenId,
          },
          {
            lastOwnerAddressCheckAt: new Date(),
          },
        );
      });
      await this.tokenJobRepository.manager.update(TokenJobEntity, job.id, {
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

  async scheduleNextJobs(): Promise<void> {
    const jobs = await this.tokenJobRepository.find({
      where: {
        status: TokenJobStatus.Created,
        type: TokenJobType.FetchOwnerAddress,
        executeAt: LessThan(new Date()),
      },
      order: {
        executeAt: 'ASC',
      },
      take: 30,
      select: {
        id: true,
      },
    });
    await parallel(10, jobs, async (job) => {
      await this.queue.add(
        TokenJobJobs.ExecuteFetchOwnerAddressByJob,
        {
          jobId: job.id,
        },
        {
          jobId: `${TokenJobJobs.ExecuteFetchOwnerAddressByJob}:${job.id}`,
          attempts: 3,
          removeOnComplete: {
            age: 2 * 60,
            count: 1000,
          },
          removeOnFail: true,
        },
      );
    });
  }
}
