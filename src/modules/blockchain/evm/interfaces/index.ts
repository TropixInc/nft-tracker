import { BigNumber } from '@ethersproject/bignumber';
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
