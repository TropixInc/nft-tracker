import { ChainId } from 'common/enums';
import { Optional } from 'src/common/interfaces';
import { LogParsed } from 'src/modules/blockchain/evm/interfaces';
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
  hasMetadata: boolean;
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

export interface NftContract {
  address: string;
}

export interface NftContractMetadata {
  name?: Optional<string>;
  symbol?: Optional<string>;
  totalSupply?: Optional<string>;
  tokenType?: Optional<string>;
}

export interface NftId {
  tokenId: string;
  tokenMetadata: {
    tokenType: string;
  };
}

export interface NftTokenUri {
  raw: string;
  gateway: string;
}

export interface NftMedia {
  raw?: Optional<string>;
  gateway?: Optional<string>;
}
export interface Nft {
  contract: NftContract;
  contractMetadata: NftContractMetadata;
  id: NftId;
  title?: Optional<string>;
  description?: Optional<string>;
  tokenUri: NftTokenUri;
  media: NftMedia[];
  metadata?: Optional<Record<string, unknown>>;
}

export interface TokenAsset {
  id: string;
  rawUrl: string;
  publicId: string;
  url?: Optional<string>;
  status: TokenAssetStatus;
}

export type TokenHistoryParams = LogParsed & { chainId: ChainId };
