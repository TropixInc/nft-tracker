import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { CronExpression } from '@nestjs/schedule';
import { Queue } from 'bull';
import { LoggerContext } from 'common/decorators/logger-context.decorator';
import { scheduleRepeatableJob } from 'common/helpers/queue.helper';
import { ApplicationWorker } from 'common/interfaces';
import { LocalQueueEnum, TokenJobJobs } from 'modules/queue/enums';
import { TokensJobsVerifyMintService } from '../tokens-jobs-verify-mint.service';

@Processor(LocalQueueEnum.TokenJob)
export class TokenJobProcessor implements ApplicationWorker<'executeVerifyMint' | 'checkJobFrozen'> {
  private logger = new Logger(TokenJobProcessor.name);

  constructor(
    @InjectQueue(LocalQueueEnum.TokenJob)
    private readonly queue: Queue,
    private readonly verifyMintService: TokensJobsVerifyMintService,
  ) {}

  @LoggerContext()
  async onApplicationBootstrap() {
    this.scheduleJobs().catch((error: Error) => this.logger.error(error.message, error.stack));
  }

  @LoggerContext()
  async scheduleJobs() {
    await Promise.all([
      scheduleRepeatableJob(
        this.queue,
        TokenJobJobs.ExecuteVerifyMint,
        `schedule:${TokenJobJobs.ExecuteVerifyMint}`,
        {
          repeat: {
            cron: CronExpression.EVERY_10_SECONDS,
          },
          removeOnComplete: true,
          removeOnFail: true,
        },
        this.logger,
      ),
      scheduleRepeatableJob(
        this.queue,
        TokenJobJobs.CheckJobFrozen,
        `schedule:${TokenJobJobs.CheckJobFrozen}`,
        {
          repeat: {
            cron: CronExpression.EVERY_MINUTE,
          },
          removeOnComplete: true,
          removeOnFail: true,
        },
        this.logger,
      ),
    ]);
  }

  @Process({ name: TokenJobJobs.ExecuteVerifyMint })
  @LoggerContext({ logError: true })
  async executeVerifyMintHandler() {
    await this.verifyMintService.execute();
  }

  @Process({ name: TokenJobJobs.CheckJobFrozen })
  @LoggerContext({ logError: true })
  async checkJobFrozenHandler() {
    await this.verifyMintService.checkJobsHaveAlreadyStartedButNotFinished();
  }
}
