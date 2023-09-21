import { ChainId } from 'common/enums';
import { Optional } from 'src/common/interfaces';
import { TokenJobStatus, TokenJobType } from '../enums';

export interface Token {
  id: string;
  address: string;
  tokenId: string;
  tokenUri: string;
  name?: Optional<string>;
  description?: Optional<string>;
  externalUrl?: Optional<string>;
  imageRawUrl?: Optional<string>;
  imageGatewayUrl?: Optional<string>;
  chainId: ChainId;
  metadata: Record<string, unknown> | null;
}

export interface TokenJob {
  address: string;
  chainId: ChainId;
  tokensIds: string[];
  tokensUris?: Optional<string[]>;
  executeAt?: Optional<Date>;
  status: TokenJobStatus;
  type: TokenJobType;
}
