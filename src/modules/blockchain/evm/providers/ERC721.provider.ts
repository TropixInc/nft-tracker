import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BigNumberish } from 'ethers';
import { isString } from 'lodash';
import { ChainId } from 'src/common/enums';
import { Optional } from 'src/common/interfaces';
import { AppConfig } from 'src/config/app.config';
import { EthereumService } from '../ethereum.service';
import { ERC721 } from '../interfaces/ERC721';
import erc721Abi from '../static/erc721.abi.json';

@Injectable()
export class ERC721Provider extends EthereumService {
  constructor(protected readonly configService: ConfigService<AppConfig>) {
    super(configService);
  }

  async create<ContractInterface extends ERC721>(address: string, chainId: ChainId) {
    const contract = this.getContractAt<ContractInterface>(address, chainId, erc721Abi);

    return new ERC721Contract<ContractInterface>(contract, this.configService);
  }
}

export class ERC721Contract<T extends ERC721> extends EthereumService {
  constructor(
    private readonly contract: T,
    protected readonly configService: ConfigService<AppConfig>,
  ) {
    super(configService);
  }

  async name(): Promise<string> {
    try {
      return await this.contract.name();
    } catch (error) {
      return '';
    }
  }
  async symbol(): Promise<string> {
    try {
      return await this.contract.symbol();
    } catch (error) {
      return '';
    }
  }

  async totalSupply(): Promise<Optional<string>> {
    try {
      const totalSupply = await this.contract.totalSupply();
      return totalSupply?.toString();
    } catch (error) {
      return null;
    }
  }

  async getTokenUri(tokenId: BigNumberish): Promise<Optional<string>> {
    try {
      return await this.contract.tokenURI(tokenId);
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async getContractUri() {
    try {
      return await this.contract.contractURI();
    } catch (error) {
      return null;
    }
  }

  async getBaseUri(): Promise<Optional<string>> {
    try {
      return await this.contract.baseURI();
    } catch (error) {
      return null;
    }
  }

  formatTokenUri(tokenId: string, baseUri?: Optional<string>, tokenUri?: Optional<string>): string {
    if (!tokenUri && !baseUri) {
      return '';
    }
    if (!baseUri) {
      return this.sanitizeTokenUri(tokenUri!);
    }
    let uri = baseUri;

    if (isString(tokenUri) && baseUri.endsWith('/')) {
      uri = `${baseUri}${tokenUri}`;
    } else if (isString(tokenUri) && !baseUri.endsWith('/')) {
      uri = `${baseUri}/${tokenUri}`;
    }

    if (uri.includes('{id}')) {
      uri = uri.replace('{id}', tokenId);
    }

    return this.sanitizeTokenUri(uri);
  }

  sanitizeTokenUri(tokenUri: string): string {
    return tokenUri.replace(/^ipfs:\/\/ipfs\//, 'https://ipfs.io/ipfs/');
  }
}
