import { ChainId } from 'common/enums';
import { Optional } from 'src/common/interfaces';
import { TokenAssetStatus, TokenJobStatus, TokenJobType } from '../enums';

export interface Token {
  id: string;
  address: string;
  tokenId: string;
  tokenUri: string;
  name?: Optional<string>;
  description?: Optional<string>;
  externalUrl?: Optional<string>;
  imageRawUrl?: Optional<string>;
  chainId: ChainId;
  metadata: Record<string, unknown> | null;
  assetId?: Optional<string>;
  asset?: Optional<TokenAsset>;
}

export interface TokenJob {
  address?: Optional<string>;
  chainId?: Optional<ChainId>;
  tokensIds: string[];
  tokensUris?: Optional<string[]>;
  executeAt?: Optional<Date>;
  status: TokenJobStatus;
  type: TokenJobType;
}

export interface Nft {
  contract: {
    address: string;
  };
  contractMetadata: {
    name?: Optional<string>;
    symbol?: Optional<string>;
    totalSupply?: Optional<string>;
    tokenType?: Optional<string>;
  };
  id: {
    tokenId: string;
    tokenMetadata: {
      tokenType: string;
    };
  };
  title?: Optional<string>;
  description?: Optional<string>;
  tokenUri: {
    raw: string;
    gateway: string;
  };
  media: {
    raw?: Optional<string>;
    gateway?: Optional<string>;
  }[];
  metadata?: Optional<Record<string, unknown>>;
}

export interface TokenAsset {
  id: string;
  rawUrl: string;
  publicId: string;
  url?: Optional<string>;
  status: TokenAssetStatus;
}
