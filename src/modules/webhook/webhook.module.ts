import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebhookAttemptEntity } from './entities/webhook-attempt.entity';
import { WebhookService } from './webhook.service';
import { WebhookProcessor } from 'modules/webhook/queue/webhook.processor';
import { QueueModule } from 'modules/queue/queue.module';

@Global()
@Module({
  imports: [QueueModule, TypeOrmModule.forFeature([WebhookAttemptEntity])],
  providers: [WebhookService, WebhookProcessor],
  exports: [WebhookService],
})
export class WebhookModule {}
