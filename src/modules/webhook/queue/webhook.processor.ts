import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Queue, Job } from 'bull';
import { ApplicationWorker } from 'common/interfaces';
import { LocalQueueEnum, WebhookJobs } from 'modules/queue/enums';
import { WebhookService } from 'modules/webhook/webhook.service';
import { CronExpression } from '@nestjs/schedule';
import { scheduleRepeatableJob } from 'common/helpers/queue.helper';
import { asyncPaginateRawAndEntities } from 'common/helpers/iterator.helper';
import { LoggerContext } from 'common/decorators/logger-context.decorator';

@Processor(LocalQueueEnum.Webhook)
export class WebhookProcessor implements ApplicationWorker<'retryWebhook'> {
  private logger = new Logger(WebhookProcessor.name);

  constructor(
    @InjectQueue(LocalQueueEnum.Webhook)
    private readonly queue: Queue,
    private readonly webhookService: WebhookService,
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
        WebhookJobs.SyncWebhookFailed,
        `schedule:${WebhookJobs.SyncWebhookFailed}`,
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
  @Process({ name: WebhookJobs.SyncWebhookFailed })
  @LoggerContext({ logError: true })
  async syncWebhookFailedHandler() {
    const queryBuilder = this.webhookService.getAttemptsFailedAfterOneMinute();
    for await (const item of asyncPaginateRawAndEntities(queryBuilder)) {
      if (!item) continue;
      await this.queue.add(WebhookJobs.RetryWebhook, { id: item.id }, { removeOnComplete: true, removeOnFail: true });
    }
  }
  @Process({ name: WebhookJobs.RetryWebhook })
  @LoggerContext({ logError: true })
  async retryWebhookHandler(job: Job<{ id: string }>) {
    await this.webhookService.retry(job.data.id);
  }
}
