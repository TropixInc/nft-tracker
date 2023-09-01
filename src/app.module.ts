import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as redisStore from 'cache-manager-redis-store';
import { LoggerModule } from 'nestjs-pino';
import { Options } from 'pino-http';
import { CacheModule, CacheManagerOptions } from '@nestjs/cache-manager';

import { AppConfig, getAppConfig, validationSchema } from 'config/app.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { config as TypeOrmConfig } from './ormconfig';

import { DatabaseModule } from 'database/database.module';
import { HealthModule } from 'modules/health/health.module';

import { QueueModule } from 'modules/queue/queue.module';

import { ConfigurationModule } from 'modules/configuration/configuration.module';
import { RequestIpMiddleware } from 'common/middlewares/request-ip.middleware';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { UUIDHelper } from 'common/helpers/uuid.helper';
import { WebhookModule } from 'modules/webhook/webhook.module';
import { ApplicationEnvEnum } from 'common/enums';

@Module({
  imports: [
    EventEmitterModule.forRoot({
      global: true,
      wildcard: true,
    }),
    ConfigModule.forRoot({
      load: [getAppConfig],
      validationSchema,
      cache: true,
      isGlobal: true,
    }),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 5000,
    }),
    TypeOrmModule.forRoot({ ...TypeOrmConfig, autoLoadEntities: true }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig, true>) => {
        const cacheManager = configService.get('cache_manager');
        const config: CacheManagerOptions = {
          store: redisStore.create({
            url: cacheManager.url,
            prefix: cacheManager.prefix,
          }),
        };

        return config;
      },
      isGlobal: true,
    }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<AppConfig, true>) => {
        const isDevelop = configService.get('app_env') === ApplicationEnvEnum.LOCAL;
        const logLevel = configService.get('log_level');

        const pinoConfig: { pinoHttp: Options; exclude: any[] } = {
          pinoHttp: {
            prettifier: isDevelop,
            level: logLevel,
            autoLogging: false,
            quietReqLogger: true,
            useOnlyCustomLevels: false,
            customLevels: {
              trace: 10,
              verbose: 10,
            },
            genReqId: () => UUIDHelper.generate(),
          },
          exclude: [
            { method: RequestMethod.ALL, path: '/health' },
            { method: RequestMethod.GET, path: '(.*)' },
          ],
        };

        if (isDevelop) {
          pinoConfig.pinoHttp.transport = {
            target: 'pino-pretty',
          };
          pinoConfig.pinoHttp.level = logLevel;
        }

        return pinoConfig;
      },
    }),
    ScheduleModule.forRoot(),
    ConfigurationModule,
    QueueModule,
    HealthModule,
    DatabaseModule,
    WebhookModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIpMiddleware).forRoutes('*');
  }
}
