import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HEADER_API_KEY } from 'src/modules/auth/constants';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as packageJSON from '../../package.json';
import { AppConfig } from './app.config';

/**
 * Setup swagger module.
 * @param app Nest Application
 */
export const setupSwagger = (app: INestApplication) => {
  const configService = app.get<ConfigService<AppConfig, true>>(ConfigService);

  const config = new DocumentBuilder()
    .setTitle('NFT Tracker')
    .setVersion(packageJSON.version)
    .addServer(configService.get('base_url'), 'NFT Tracker Server', {})
    .addApiKey({ type: 'apiKey', in: 'header', name: HEADER_API_KEY, description: 'API Key' }, HEADER_API_KEY)
    .build();
  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  });
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true, tagsSorter: 'alpha', operationsSorter: 'alpha' },
  });

  const sdkDocument = SwaggerModule.createDocument(app, config, {
    include: [],
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  });

  SwaggerModule.setup('sdk', app, sdkDocument, {
    swaggerOptions: { persistAuthorization: true, tagsSorter: 'alpha', operationsSorter: 'alpha' },
  });
};
