import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { HealthCheckError, HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { Queue } from 'bull';
import { LocalQueueEnum } from './enums';

@Injectable()
export class QueueHealthIndicator extends HealthIndicator {
  queues: Map<string, Queue> = new Map();

  constructor(@InjectQueue(LocalQueueEnum.WEBHOOK) private readonly webhookQueue: Queue) {
    super();
    this.queues.set(webhookQueue.name, webhookQueue);
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const queueStatus = await this.getQueueStatus(key);
    const isHealthy = queueStatus.is_ready;
    const result = this.getStatus(`${key}_queue`, isHealthy, queueStatus);

    if (isHealthy) {
      return result;
    }

    throw new HealthCheckError(`${QueueHealthIndicator.name}`, result);
  }

  private async getQueueStatus(queueName: string) {
    const queue = this.queues.get(queueName);

    if (!queue) {
      return {
        is_ready: false,
        is_paused: true,
        name: queueName,
        counts: 0,
      };
    }

    const [ready, paused, counts] = await Promise.all([queue.isReady(), queue.isPaused(), queue.getJobCounts()]);

    return {
      is_ready: !!ready,
      is_paused: paused,
      name: ready.name,
      counts,
    };
  }
}
