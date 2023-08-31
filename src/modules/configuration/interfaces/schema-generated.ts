// AUTO-GENERATED;

export interface EMAIL_ACCOUNT {
  default: {
    subject: {
      'pt-br': string;
      en: string;
      [k: string]: unknown;
    };
    template: {
      html: {
        'pt-br': string;
        en: string;
        [k: string]: unknown;
      };
      text: {
        'pt-br': string;
        en: string;
        [k: string]: unknown;
      };
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  invite: {
    subject: {
      'pt-br': string;
      en: string;
      [k: string]: unknown;
    };
    template: {
      html: {
        'pt-br': string;
        en: string;
        [k: string]: unknown;
      };
      text: {
        'pt-br': string;
        en: string;
        [k: string]: unknown;
      };
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  signup: {
    subject: {
      'pt-br': string;
      en: string;
      [k: string]: unknown;
    };
    template: {
      html: {
        'pt-br': string;
        en: string;
        [k: string]: unknown;
      };
      text: {
        'pt-br': string;
        en: string;
        [k: string]: unknown;
      };
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  retry: {
    subject: {
      'pt-br': string;
      en: string;
      [k: string]: unknown;
    };
    template: {
      html: {
        'pt-br': string;
        en: string;
        [k: string]: unknown;
      };
      text: {
        'pt-br': string;
        en: string;
        [k: string]: unknown;
      };
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
// AUTO-GENERATED;

export interface AUTH_VERIFICATION_EXPIRE {
  invite: string;
  signup: string;
  requestResetPassword: string;
  [k: string]: unknown;
}
// AUTO-GENERATED;

export interface USER_CODE_EXPIRATION_SETTINGS {
  codeValidityDurationMinutes: number;
  systemValidityBufferMinutes: number;
  [k: string]: unknown;
}
// AUTO-GENERATED;

export type WALLETS_BALANCES = {
  name: string;
  wallet: string;
  minimum: string;
  [k: string]: unknown;
}[];
// AUTO-GENERATED;

export type MULTIFACE_ENVS = {
  key: string;
  secret: string;
  url: string;
  tenantId: string;
  [k: string]: unknown;
}[];

export type ConfigSchema =
  | EMAIL_ACCOUNT
  | AUTH_VERIFICATION_EXPIRE
  | USER_CODE_EXPIRATION_SETTINGS
  | WALLETS_BALANCES
  | MULTIFACE_ENVS;

export type ConfigKeys =
  | 'EMAIL_ACCOUNT'
  | 'AUTH_VERIFICATION_EXPIRE'
  | 'USER_CODE_EXPIRATION_SETTINGS'
  | 'WALLETS_BALANCES'
  | 'MULTIFACE_ENVS';

export interface ConfigStorage {
  EMAIL_ACCOUNT: EMAIL_ACCOUNT;
  AUTH_VERIFICATION_EXPIRE: AUTH_VERIFICATION_EXPIRE;
  USER_CODE_EXPIRATION_SETTINGS: USER_CODE_EXPIRATION_SETTINGS;
  WALLETS_BALANCES: WALLETS_BALANCES;
  MULTIFACE_ENVS: MULTIFACE_ENVS;
}
