// AUTO-GENERATED;

export type API_KEYS = {
  value: string;
  label: string;
  [k: string]: unknown;
}[];
// AUTO-GENERATED;

export type EVM = {
  chainId: number;
  rpc: string;
  wss: string;
  confirmation?: number;
  [k: string]: unknown;
}[];
// AUTO-GENERATED;

export type EVM_LOGS = {
  chainId: number;
  rpc: string[];
  wss: string[];
  [k: string]: unknown;
}[];

export type ConfigSchema = API_KEYS | EVM | EVM_LOGS;

export type ConfigKeys = 'API_KEYS' | 'EVM' | 'EVM_LOGS';

export interface ConfigStorage {
  API_KEYS: API_KEYS;
  EVM: EVM;
  EVM_LOGS: EVM_LOGS;
}
