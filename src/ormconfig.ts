/* eslint-disable @typescript-eslint/no-unused-vars */
import 'dotenv/config';

import { ApplicationEnvEnum } from 'common/enums';
import { getAppConfig } from 'config/app.config';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { DataSource, SelectQueryBuilder } from 'typeorm';
import fg from 'fast-glob';
import { SnakeNamingStrategy } from 'database/snake-naming.strategy';
import { RedisClientOptions } from 'common/helpers/connection.helper';

export const isExistsQuery = (query: string) => `CASE WHEN EXISTS(${query}) THEN 1 ELSE 0 END AS "exists"`;
declare module 'typeorm' {
  interface SelectQueryBuilder<Entity> {
    exists<T>(): Promise<boolean>;
  }
}

SelectQueryBuilder.prototype.exists = async function (): Promise<boolean> {
  const result = await this.select(isExistsQuery(this.getQuery())).where('').take(1).getRawOne();
  return result?.exists == '1';
};

const appConfig = getAppConfig();

function loadSync(fileSourcePattern: string, keyMatchPattern: (string) => boolean): any[] {
  const entries = fg.sync(__dirname + fileSourcePattern, { dot: true, absolute: false, onlyFiles: true });
  return entries
    .map((entry) => require(entry))
    .map((entity) => {
      const e: any[] = [];
      Object.keys(entity).forEach((key) => {
        if (keyMatchPattern(key)) {
          e.push(entity[key]);
        }
      });
      return e;
    })
    .flat();
}

export const entities: any[] = loadSync(
  '/**/*.entity{.ts,.js}',
  (key) => key.endsWith('Entity') && !key.endsWith('BaseEntity'),
);
export const migrations: any[] = loadSync('/modules/database/migrations/*{.ts,.js}', () => true);
export const subscribers: any[] = loadSync('/**/*.subscriber{.ts,.js}', () => true);

// Check typeORM documentation for more information.
export const config: PostgresConnectionOptions = {
  type: 'postgres',
  host: appConfig.database.host,
  port: appConfig.database.port,
  username: appConfig.database.user,
  password: appConfig.database.password,
  database: appConfig.database.name,
  applicationName: appConfig.name,

  // We are using migrations, synchronize should be set to false.
  synchronize: false,

  // Run migrations automatically.
  migrationsRun: appConfig.app_env === ApplicationEnvEnum.STAGING, // Business decision
  logging: appConfig.app_env === ApplicationEnvEnum.PRODUCTION ? ['error', 'warn'] : true,
  logger: 'file',
  connectTimeoutMS: 10000,
  maxQueryExecutionTime: 100,
  // Allow both start:prod and start:dev to use migrations
  // __dirname is either dist or src folder, meaning either
  // the compiled js in prod or the ts in dev.
  migrations,
  cache: {
    type: 'redis',
    options: {
      ...appConfig.cache_manager,
      prefix: `${appConfig.cache_manager.prefix}query:`,
    } as RedisClientOptions,
    ignoreErrors: true,
  },
  namingStrategy: new SnakeNamingStrategy(),
};

export default new DataSource({
  ...config,
  entities,
  subscribers,
});
