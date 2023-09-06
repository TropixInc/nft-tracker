import { ChainId } from 'common/enums';

export interface Contract {
  id: string;
  name: string;
  symbol: string;
  address: string;
  chainId: ChainId;
  cacheMedia: boolean;
}
