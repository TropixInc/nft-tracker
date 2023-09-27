import { BytesLike } from '@ethersproject/bytes';
import { BigNumberish, ethers } from 'ethers';

export class ERC721 extends ethers.Contract {
  balanceOf(owner: string): Promise<BigNumberish>;
  baseURI(): Promise<string>;
  contractURI(): Promise<string>;
  name(): Promise<string>;
  owner(): Promise<string>;
  ownerOf(tokenId: BigNumberish): Promise<string>;
  supportsInterface(interfaceId: BytesLike): Promise<boolean>;
  symbol(): Promise<string>;
  tokenURI(tokenId: BigNumberish): Promise<string>;
  uri(tokenId: BigNumberish): Promise<string>;
  totalSupply(): Promise<BigNumberish>;
}
