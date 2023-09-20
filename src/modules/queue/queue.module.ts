import { InjectQueue } from '@nestjs/bull';
import { Logger, Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bull';
import { LocalQueueEnum } from './enums';
import { LocalConfig } from './queue.config';
import { QueueHealthIndicator } from './queue.health';
import { Queues } from './queues';

@Module({
  imports: [LocalConfig, ...Queues],
  providers: [ConfigService, QueueHealthIndicator],
  exports: [...Queues, QueueHealthIndicator],
})
export class QueueModule implements OnModuleInit, OnModuleDestroy {
  logger = new Logger(QueueModule.name);
  queues: Queue[];

  constructor(
    @InjectQueue(LocalQueueEnum.Webhook) webhookQueue: Queue,
    @InjectQueue(LocalQueueEnum.TokenJob) tokenJobQueue: Queue,
  ) {
    this.queues = [webhookQueue, tokenJobQueue];
  }

  /**
   * It resumes the queues.
   */
  async onModuleInit() {
    await this.resumeQueues();
  }

  /**
   * Pause all the queues
   */
  async onModuleDestroy() {
    await this.pauseQueues();
  }

  /**
   * If any queue is paused, resume it
   */
  private async resumeQueues() {
    for await (const queue of this.queues) {
      if (await queue.isPaused(true)) {
        await queue.resume(true);
        this.logger.log(`Queue [${queue.name}] was resumed.`);
      }
    }
  }

  /**
   * Pause all queues
   */
  private async pauseQueues() {
    for await (const queue of this.queues) {
      try {
        this.logger.log(`Pausing queue [${queue.name}]...`);
        await queue.pause(true);
        this.logger.log(`Queue [${queue.name}] was paused.`);
      } catch (error) {
        this.logger.error(error.message, error.stack);
      }
    }
  }
}
