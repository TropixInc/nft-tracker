import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { forwardRef, Inject, Logger } from '@nestjs/common';
import { CronExpression } from '@nestjs/schedule';
import { Job, Queue } from 'bull';
import { LoggerContext } from 'common/decorators/logger-context.decorator';
import { scheduleRepeatableJob } from 'common/helpers/queue.helper';
import { ApplicationWorker } from 'common/interfaces';
import { LocalQueueEnum, TokenJobJobs } from 'modules/queue/enums';
import { TokensJobsFetchMetadataService } from '../tokens-jobs-fetch-metadata.service';
import { TokensJobsVerifyMintService } from '../tokens-jobs-verify-mint.service';
import { TokensJobsFetchOwnerAddressService } from '../tokens-jobs-fetch-owner-address.service';
import { TokensJobsUploadAssetService } from '../tokens-jobs-upload-asset.service';
import { TokensJobsRefreshTokenService } from '../tokens-jobs-refresh-token.service';
import { ContractService } from 'src/modules/contracts/contract.service';

@Processor(LocalQueueEnum.TokenJob)
export class TokenJobProcessor
  implements
    ApplicationWorker<
      | 'executeVerifyMint'
      | 'checkJobFrozen'
      | 'executeFetchMetadata'
      | 'executeFetchOwnerAddress'
      | 'executeUploadAsset'
      | 'executeRefreshToken'
      | 'createFetchJobs'
      | 'createFetchOwnerAddressJobs'
      | 'syncTotalSupply'
      | 'resyncVerifyMint'
    >
{
  private logger = new Logger(TokenJobProcessor.name);

  constructor(
    @InjectQueue(LocalQueueEnum.TokenJob)
    private readonly queue: Queue,
    private readonly verifyMintService: TokensJobsVerifyMintService,
    private readonly fetchMetadataService: TokensJobsFetchMetadataService,
    private readonly fetchOwnerAddressService: TokensJobsFetchOwnerAddressService,
    private readonly uploadAssetService: TokensJobsUploadAssetService,
    private readonly refreshTokenService: TokensJobsRefreshTokenService,
    @Inject(forwardRef(() => ContractService))
    private readonly contractService: ContractService,
  ) {}

  @LoggerContext()
  async onApplicationBootstrap() {
    this.scheduleJobs().catch((error: Error) => this.logger.error(error.message, error.stack));
  }

  @LoggerContext()
  async scheduleJobs() {
    const jobs = [
      {
        name: TokenJobJobs.CreateFetchJobs,
        cron: CronExpression.EVERY_MINUTE,
      },
      {
        name: TokenJobJobs.CreateVerifyMintJobs,
        cron: CronExpression.EVERY_10_SECONDS,
      },
      {
        name: TokenJobJobs.CreateFetchOwnerAddressJobs,
        cron: CronExpression.EVERY_MINUTE,
      },
      {
        name: TokenJobJobs.CheckJobFrozen,
        cron: CronExpression.EVERY_MINUTE,
      },
      {
        name: TokenJobJobs.SyncTotalSupply,
        cron: CronExpression.EVERY_HOUR,
      },
      {
        name: TokenJobJobs.ResyncVerifyMint,
        cron: CronExpression.EVERY_HOUR,
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

  @Process({ name: TokenJobJobs.ExecuteVerifyMintByJob, concurrency: 1 })
  @LoggerContext({ logError: true })
  async executeVerifyMintHandler(job: Job<{ jobId: string }>) {
    await this.verifyMintService.execute(job.data.jobId);
  }

  @Process({ name: TokenJobJobs.ExecuteFetchMetadataByJob, concurrency: 1 })
  @LoggerContext({ logError: true })
  async executeFetchMetadataHandler(job: Job<{ jobId: string }>) {
    await this.fetchMetadataService.execute(job.data.jobId);
  }

  @Process({ name: TokenJobJobs.ExecuteFetchOwnerAddressByJob, concurrency: 1 })
  @LoggerContext({ logError: true })
  async executeFetchOwnerAddressHandler(job: Job<{ jobId: string }>) {
    await this.fetchOwnerAddressService.execute(job.data.jobId);
  }

  @Process({ name: TokenJobJobs.ExecuteUploadAssetByJob, concurrency: 1 })
  @LoggerContext({ logError: true })
  async executeUploadAssetHandler(job: Job<{ jobId: string }>) {
    await this.uploadAssetService.execute(job.data.jobId);
  }

  @Process({ name: TokenJobJobs.ExecuteRefreshTokenByJob, concurrency: 5 })
  @LoggerContext({ logError: true })
  async executeRefreshTokenHandler(job: Job<{ jobId: string }>) {
    await this.refreshTokenService.execute(job.data.jobId);
  }

  @Process({ name: TokenJobJobs.CheckJobFrozen })
  @LoggerContext({ logError: true })
  async checkJobFrozenHandler() {
    await Promise.all([
      this.verifyMintService.checkJobsHaveAlreadyStartedButNotFinished(),
      this.fetchMetadataService.checkJobsHaveAlreadyStartedButNotFinished(),
      this.fetchOwnerAddressService.checkJobsHaveAlreadyStartedButNotFinished(),
      this.uploadAssetService.checkJobsHaveAlreadyStartedButNotFinished(),
      this.fetchMetadataService.checkTokensWithoutMetadataForLongTime(),
      this.uploadAssetService.checkTokensWithoutMediaCache(),
    ]);
  }

  @Process({ name: TokenJobJobs.CreateFetchJobs })
  @LoggerContext({ logError: true })
  async createFetchJobsHandler() {
    await Promise.all([
      this.fetchMetadataService.scheduleNextJobs(),
      this.fetchOwnerAddressService.scheduleNextJobs(),
      this.uploadAssetService.scheduleNextJobs(),
      this.refreshTokenService.scheduleNextJobs(),
    ]);
  }

  @Process({ name: TokenJobJobs.CreateVerifyMintJobs })
  @LoggerContext({ logError: true })
  async createVerifyMintJobs() {
    await this.verifyMintService.scheduleNextJobs();
  }

  @Process({ name: TokenJobJobs.CreateFetchOwnerAddressJobs })
  @LoggerContext({ logError: true })
  async createFetchOwnerAddressJobsHandler() {
    await this.fetchOwnerAddressService.checkTokensOwnerAddressNotChangeForLongTime();
  }

  @Process({ name: TokenJobJobs.SyncTotalSupply })
  @LoggerContext({ logError: true })
  async syncTotalSupplyHandler() {
    await this.contractService.syncTotalSupply();
  }

  @Process({ name: TokenJobJobs.ResyncVerifyMint })
  @LoggerContext({ logError: true })
  async resyncVerifyMintHandler() {
    await this.verifyMintService.resyncVerifyMint();
  }
}
