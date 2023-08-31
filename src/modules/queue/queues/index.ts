import { BullModule } from '@nestjs/bull';
import { LocalQueueEnum, QueueConfigEnum } from '../enums';

export const Queues = [
  BullModule.registerQueue({
    name: LocalQueueEnum.WEBHOOK,
    configKey: QueueConfigEnum.LOCAL,
  }),
];
