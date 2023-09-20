import { BullModule } from '@nestjs/bull';
import { LocalQueueEnum, QueueConfigEnum } from '../enums';

export const Queues = [
  BullModule.registerQueue({
    name: LocalQueueEnum.Webhook,
    configKey: QueueConfigEnum.Local,
  }),
  BullModule.registerQueue({
    name: LocalQueueEnum.TokenJob,
    configKey: QueueConfigEnum.Local,
    defaultJobOptions: {
      delay: 500,
      stackTraceLimit: 5,
      removeOnComplete: true,
      attempts: 1,
      timeout: 15 * 60 * 1000,
    },
  }),
];
