import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BigNumberish } from 'ethers';
import { ChainId } from 'src/common/enums';
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

  async totalSupply(): Promise<string | null> {
    try {
      const totalSupply = await this.contract.totalSupply();
      return totalSupply?.toString();
    } catch (error) {
      return null;
    }
  }

  async tokenUri(tokenId: BigNumberish): Promise<string | null> {
    try {
      return await this.contract.tokenURI(tokenId);
    } catch (error) {
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
}
