export enum ApplicationEnvEnum {
  LOCAL = 'local',
  STAGING = 'staging',
  PRODUCTION = 'production',
  TEST = 'test',
}

export enum NodeEnvEnum {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test',
}

export type NodeEnv = 'development' | 'production' | 'test';

export type LogLevel = 'info' | 'error' | 'warn' | 'debug' | 'verbose';

export enum SecondsTTL {
  EVERY_5_SECONDS = 5,
  EVERY_15_SECONDS = 15,
  EVERY_30_SECONDS = 30,
  EVERY_MINUTE = 60,
  EVERY_5_MINUTES = 300,
  EVERY_30_MINUTES = 1800,
  EVERY_2_HOURS = 7200,
}

export enum ChainId {
  MAINNET = 1,
  LOCALHOST = 1337,
  MUMBAI = 80001,
  POLYGON = 137,
  MOONBEAM = 1284,
  MOONRIVER = 1285,
}
