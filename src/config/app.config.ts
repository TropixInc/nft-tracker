// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore

import { isObject } from 'class-validator';
import * as Joi from 'joi';
import * as packageJSON from '../../package.json';
import { DatabaseConfig, DatabaseEnv, DatabaseValidations } from './database.config';
import { splitClear, splitLog } from './helpers';
import { ApplicationEnvEnum, ChainId, LogLevel, NodeEnv } from 'common/enums';
import { createJSONObjectValidator } from 'common/helpers/joi.helper';
import { parseRedisURL } from 'common/helpers/connection.helper';
export interface CloudinaryConfig {
  endpointUrl: string;
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  folder: string;
}

export interface AppConfig {
  version: string;
  app_env: ApplicationEnvEnum;
  name: string;
  host: string;
  port: number;
  log_level: LogLevel;
  database: DatabaseConfig;
  cache_manager: {
    url: string;
    prefix: string;
    host: string;
    port: number;
    tls?: boolean;
    database?: number;
  };
  queue_url: string;
  node_env: NodeEnv;
  cors_origins: string[];
  base_url: string;
  feature_flags?: Record<string, any>;
  cloudinary: CloudinaryConfig;
  chain_ids: ChainId[];
}

export interface EnvironmentVariables extends DatabaseEnv {
  NODE_ENV: NodeEnv;
  APP_NAME: string;
  APP_ENV?: ApplicationEnvEnum;
  HOST: string;
  PORT: number;
  LOG_LEVEL: LogLevel[];
  CACHE_MANAGER_URL: string;
  CACHE_MANAGER_PREFIX: string;
  QUEUE_URL: string;
  CORS_ORIGINS: string[];
  BASE_URL: string;
  FEATURE_FLAGS?: Record<string, boolean>;
  CLOUDINARY: CloudinaryConfig;
  CHAIN_IDS: ChainId[];
}

export const validationSchema = Joi.object<EnvironmentVariables, true>({
  APP_NAME: Joi.string()
    .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .required(),
  APP_ENV: Joi.string()
    .valid(...Object.values(ApplicationEnvEnum))
    .default(ApplicationEnvEnum.LOCAL),
  NODE_ENV: Joi.string().valid('development', 'production', 'test', 'provision').default('development'),

  LOG_LEVEL: Joi.extend((joi) => ({
    type: 'logsArray',
    base: joi.array(),
    coerce: (value: string) => ({ value: splitLog(value) }),
  }))
    .logsArray()
    .items(Joi.string().valid('info', 'error', 'warn', 'debug', 'verbose')),

  HOST: Joi.string().required(),
  PORT: Joi.number().default(3000),
  CACHE_MANAGER_URL: Joi.string().uri().required(),
  CACHE_MANAGER_PREFIX: Joi.string()
    .regex(/^[a-z0-9_-]+(?:-[a-z0-9_-]+)*:$/)
    .required(),
  QUEUE_URL: Joi.string().uri().required(),
  BASE_URL: Joi.string().uri().required(),
  CORS_ORIGINS: Joi.extend((joi) => ({
    type: 'corsArray',
    base: joi.array(),
    coerce: (value) => ({ value: splitClear(value) }),
  }))
    .corsArray()
    .items(Joi.alternatives().try(Joi.string().uri(), Joi.string().valid('*')))
    .default(['*']),

  FEATURE_FLAGS: Joi.extend((joi) => ({
    type: 'featureFlags',
    base: joi.object().optional(),
    messages: {
      'featureFlags.base': 'Feature flags must be a valid JSON',
    },
    coerce: createJSONObjectValidator(),
  })).featureFlags(),
  CLOUDINARY: Joi.extend((joi) => ({
    type: 'cloudinary',
    base: joi
      .object<CloudinaryConfig, true>({
        endpointUrl: Joi.string().uri().required(),
        cloudName: Joi.string().required(),
        apiKey: Joi.string().required(),
        apiSecret: Joi.string().required(),
        folder: Joi.string().required(),
      })
      .required(),
    messages: {
      'cloudinary.base': 'Cloudinary must be a valid JSON configuration',
    },
    coerce: createJSONObjectValidator(),
  })).cloudinary(),
  CHAIN_IDS: Joi.extend((joi) => ({
    type: 'chainArray',
    base: joi.array().items(Joi.number().required()).min(1),
    coerce: (value) => ({
      value: value.split(',').map((chainId) => Number(chainId.trim())),
    }),
  }))
    .chainArray()
    .items(Joi.number().required()),
  ...DatabaseValidations,
});

export const getAppConfig = (): AppConfig => {
  const { value: env } = validationSchema.validate(process.env, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (!env) throw new Error('Invalid environment variables');

  const cacheManager = parseRedisURL(env.CACHE_MANAGER_URL);

  // prettyPrintEnv(env);

  return {
    version: packageJSON.version,
    app_env: env.APP_ENV ?? ApplicationEnvEnum.LOCAL,
    name: env.APP_NAME,
    host: env.HOST,
    port: Number(env.PORT),
    log_level: env.LOG_LEVEL ? env.LOG_LEVEL[0] : 'info',
    database: {
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      name: env.DB_NAME,
      host: env.DB_HOST,
      port: Number(env.DB_PORT),
    },
    node_env: env.NODE_ENV,
    cache_manager: {
      url: env.CACHE_MANAGER_URL,
      prefix: env.CACHE_MANAGER_PREFIX,
      host: cacheManager.socket.host!,
      port: cacheManager.socket.port!,
      tls: !!cacheManager.socket.tls,
    },
    queue_url: env.QUEUE_URL,
    cors_origins: env.CORS_ORIGINS,
    base_url: env.BASE_URL,
    feature_flags: env.FEATURE_FLAGS,
    cloudinary: env.CLOUDINARY,
    chain_ids: env.CHAIN_IDS,
  };
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function prettyPrintEnv(env: Record<string, any>): void {
  // NOTE: This is a pretty print function for the environment variables should be used for debugging purposes
  console.log(
    Object.keys(env)
      .sort()
      .reduce((acc, key) => {
        acc += `${key}=${isObject(env[key]) ? JSON.stringify(env[key]) : env[key]}\n`;

        return acc;
      }, ''),
  );
}
