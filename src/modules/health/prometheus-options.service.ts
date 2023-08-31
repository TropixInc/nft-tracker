import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrometheusOptions, PrometheusOptionsFactory } from '@willsoto/nestjs-prometheus';
import { AppConfig } from 'config/app.config';
import { HealthController } from './health.controller';
@Injectable()
export class PrometheusOptionsService implements PrometheusOptionsFactory {
  constructor(private readonly configService: ConfigService<AppConfig, true>) {}
  createPrometheusOptions(): Promise<PrometheusOptions> | PrometheusOptions {
    return {
      defaultLabels: {
        app: this.configService.get<AppConfig['name']>('name'),
      },
      path: '/health',
      controller: HealthController,
    };
  }
}
