import { BigNumber } from '@ethersproject/bignumber';
import { Transaction } from 'ethers';
import { ChainId } from 'src/common/enums';

export interface EventSyncBlock {
  blockNumber: number;
  chainId: ChainId;
}

export interface LogParsed {
  args: { from: string; to: string; tokenId: BigNumber };
  transactionHash: string;
  blockHash: string;
  blockNumber: number;
  address: string;
  transactionIndex: number;
  name: string;
  signature: string;
  topics: string[];
  topic: string;
  timestamp: number;
}

export interface ErrorCode {
  code: number;
  message?: string;
}

export interface Error {
  reason: string;
  code: string;
  body: string;
  error: ErrorCode;
  requestBody: string;
  requestMethod: string;
  url: string;
  message?: string;
  stack?: string;
}

export interface JsonRpcError {
  reason: string;
  code: string;
  error: Error;
  method: string;
  transactionHash: string;
  transaction?: Transaction;
}
