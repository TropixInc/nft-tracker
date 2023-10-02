import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { CronExpression } from '@nestjs/schedule';
import { Job, Queue } from 'bull';
import { LoggerContext } from 'common/decorators/logger-context.decorator';
import { scheduleRepeatableJob } from 'common/helpers/queue.helper';
import { ApplicationWorker } from 'common/interfaces';
import { LocalQueueEnum, TokenJobJobs } from 'modules/queue/enums';
import { TokensJobsFetchMetadataService } from '../tokens-jobs-fetch-metadata.service';
import { TokensJobsVerifyMintService } from '../tokens-jobs-verify-mint.service';
import { TokensJobsFetchOwnerAddressService } from '../tokens-jobs-fetch-owner-address.service';

@Processor(LocalQueueEnum.TokenJob)
export class TokenJobProcessor
  implements
    ApplicationWorker<
      | 'executeVerifyMint'
      | 'checkJobFrozen'
      | 'executeFetchMetadata'
      | 'executeFetchOwnerAddress'
      | 'createFetchMetadataJobs'
      | 'createFetchOwnerAddressJobs'
    >
{
  private logger = new Logger(TokenJobProcessor.name);

  constructor(
    @InjectQueue(LocalQueueEnum.TokenJob)
    private readonly queue: Queue,
    private readonly verifyMintService: TokensJobsVerifyMintService,
    private readonly fetchMetadataService: TokensJobsFetchMetadataService,
    private readonly fetchOwnerAddressService: TokensJobsFetchOwnerAddressService,
  ) {}

  @LoggerContext()
  async onApplicationBootstrap() {
    this.scheduleJobs().catch((error: Error) => this.logger.error(error.message, error.stack));
  }

  @LoggerContext()
  async scheduleJobs() {
    const jobs = [
      {
        name: TokenJobJobs.CreateFetchMetadataJobs,
        cron: CronExpression.EVERY_10_SECONDS,
      },
      {
        name: TokenJobJobs.CreateFetchOwnerAddressJobs,
        cron: CronExpression.EVERY_MINUTE,
      },
      {
        name: TokenJobJobs.ExecuteVerifyMint,
        cron: CronExpression.EVERY_5_SECONDS,
      },
      {
        name: TokenJobJobs.ExecuteFetchOwnerAddress,
        cron: CronExpression.EVERY_SECOND,
      },
      {
        name: TokenJobJobs.CheckJobFrozen,
        cron: CronExpression.EVERY_MINUTE,
      },
    ];
    await Promise.all(
      jobs.map(async (job) => {
        return scheduleRepeatableJob(
          this.queue,
          job.name,
          `schedule:${job.name}`,
          {
            repeat: {
              cron: job.cron,
            },
            removeOnComplete: true,
            removeOnFail: true,
          },
          this.logger,
        );
      }),
    );
  }

  @Process({ name: TokenJobJobs.ExecuteVerifyMint, concurrency: 1 })
  @LoggerContext({ logError: true })
  async executeVerifyMintHandler() {
    await this.verifyMintService.execute();
  }

  @Process({ name: TokenJobJobs.ExecuteFetchMetadataByJob, concurrency: 5 })
  @LoggerContext({ logError: true })
  async executeFetchMetadataHandler(job: Job<{ jobId: string }>) {
    this.logger.debug(`Executing queue ${job.data.jobId}`);
    await this.fetchMetadataService.execute(job.data.jobId);
  }

  @Process({ name: TokenJobJobs.ExecuteFetchOwnerAddress, concurrency: 5 })
  @LoggerContext({ logError: true })
  async executeFetchOwnerAddressHandler() {
    await this.fetchOwnerAddressService.execute();
  }

  @Process({ name: TokenJobJobs.CheckJobFrozen })
  @LoggerContext({ logError: true })
  async checkJobFrozenHandler() {
    await Promise.all([
      this.verifyMintService.checkJobsHaveAlreadyStartedButNotFinished(),
      this.fetchMetadataService.checkJobsHaveAlreadyStartedButNotFinished(),
      this.fetchOwnerAddressService.checkJobsHaveAlreadyStartedButNotFinished(),
    ]);
  }

  @Process({ name: TokenJobJobs.CreateFetchMetadataJobs })
  @LoggerContext({ logError: true })
  async createFetchMetadataJobsHandler() {
    await Promise.all([
      this.fetchMetadataService.checkTokensWithoutMetadataForLongTime(),
      this.fetchMetadataService.scheduleNextJobs(),
    ]);
  }

  @Process({ name: TokenJobJobs.CreateFetchOwnerAddressJobs })
  @LoggerContext({ logError: true })
  async createFetchOwnerAddressJobsHandler() {
    await this.fetchOwnerAddressService.checkTokensOwnerAddressNotChangeForLongTime();
  }
}
