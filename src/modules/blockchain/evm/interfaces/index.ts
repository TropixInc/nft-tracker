import { ChainId } from 'src/common/enums';

export interface EventSyncBlock {
  blockNumber: number;
  chainId: ChainId;
}
