import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { makeGaugeProvider, PrometheusModule } from '@willsoto/nestjs-prometheus';
import { DatabaseModule } from 'database/database.module';
import { QueueModule } from 'modules/queue/queue.module';
import { HealthController } from './health.controller';
import { PrometheusOptionsService } from './prometheus-options.service';
@Module({
  imports: [
    HttpModule,
    TerminusModule,
    DatabaseModule,
    QueueModule,
    PrometheusModule.registerAsync({
      imports: [ConfigModule],
      inject: [],
      useClass: PrometheusOptionsService,
    }),
  ],
  controllers: [HealthController],
  providers: [
    makeGaugeProvider({
      name: 'app_health_checks',
      help: 'Health status of the application',
      labelNames: ['type'],
    }),
  ],
})
export class HealthModule {}
