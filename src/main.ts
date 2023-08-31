//must be the first import file of the project;
import * as dotenv from 'dotenv';
dotenv.config();

//only start newrelic if its settings don't have env
if (process.env.NEW_RELIC_LICENSE_KEY && process.env.NEW_RELIC_APP_NAME) {
  require('newrelic');
}

import { Logger as CommonLogger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AllExceptionsFilter } from 'common/filters/http-exception.filter';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { AppConfig } from 'config/app.config';
import { setupSwagger } from 'config/swagger.config';
import { useContainer } from 'class-validator';
import { getConfig } from 'common/microservices/redis.config';
import { NestExpressApplication } from '@nestjs/platform-express';

import { TypeORMError } from 'typeorm';
import { gracefulShutdownFn } from 'common/helpers/app.helpers';
import { ApplicationEnvEnum } from 'common/enums';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true, cors: true });

  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: false,
      permittedCrossDomainPolicies: true,
      crossOriginOpenerPolicy: false,
      contentSecurityPolicy: false,
    }),
  );

  const config = app.get<ConfigService<AppConfig, true>>(ConfigService);

  app.enableCors({
    // origin: config.get('cors_origins'), // TODO why '*' doesn't work?
    credentials: true,
  });

  // Set log level from config.
  app.useLogger(app.get(Logger));
  app.flushLogs();

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.useGlobalFilters(new AllExceptionsFilter());

  // Setup swagger.
  setupSwagger(app);

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  // Setup microservices
  const localRedisMicroservicesConfig = getConfig(config);
  const microservices = await app.connectMicroservice(localRedisMicroservicesConfig);
  await microservices.listen();

  // Set termination handlers (for graceful shutdown)
  const exitHandler = gracefulShutdownFn(app as any, app.get(Logger), {
    coreDump: false,
    timeout: config.get('app_env') === ApplicationEnvEnum.LOCAL ? 0 : 30_000, // 30 seconds
  });

  // Bind termination handlers
  process.on('SIGTERM', exitHandler(0, 'Signal received: SIGTERM'));
  process.on('SIGINT', exitHandler(0, 'Signal received: SIGINT'));
  process.on('uncaughtException', (err, origin) => {
    CommonLogger.error(err.message, err.stack, origin);
    if (err.message?.includes('ECONNREFUSED')) {
      return;
    }
    exitHandler(1, 'Unexpected Error');
  });
  process.on('unhandledRejection', (reason, promise) => {
    CommonLogger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    if (reason instanceof TypeORMError) {
      return;
    }
    exitHandler(1, 'Unhandled Rejection');
  });
  const PORT = config.get<AppConfig['port']>('port', 3000);
  const HOST = config.get<AppConfig['host']>('host', 'localhost');
  await app.listen(PORT, HOST);
}

bootstrap().catch((err) => {
  CommonLogger.error(err.message, err.stack);
  process.exit(1);
});
