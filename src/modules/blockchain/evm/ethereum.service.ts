import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChainId } from 'src/common/enums';
import { AppConfig } from 'src/config/app.config';
import { ethers, JsonRpcProvider } from 'ethers';
import { ChainIsNotSupportedException } from '../exceptions';

@Injectable()
export class EthereumService {
  logger = new Logger(EthereumService.name);

  private jsonRpcProvidersPool = new Map<ChainId, JsonRpcProvider>();
  constructor(protected readonly configService: ConfigService<AppConfig>) {}

  public getContractAt<T>(address: string, chainId: ChainId, abi: string[]): T {
    return new ethers.Contract(address, abi, this.getJsonRpcProviderByChainId(chainId)) as T;
  }

  public getBlockNumber(chainId: ChainId) {
    const provider = this.getJsonRpcProviderByChainId(chainId);
    return provider.getBlockNumber();
  }

  public getJsonRpcProviderByChainId(chainId: ChainId, force?: boolean) {
    if (force || !this.jsonRpcProvidersPool.has(chainId)) {
      this.jsonRpcProvidersPool.get(chainId)?.removeAllListeners();
      const provider = new JsonRpcProvider(this.getRPCUrl(chainId));
      this.jsonRpcProvidersPool.set(chainId, provider);
      return provider;
    }
    return this.jsonRpcProvidersPool.get(chainId)!;
  }

  private getRPCUrl(chainId: number) {
    switch (chainId) {
      case ChainId.LOCALHOST:
        return `http://localhost:8545`;
      case ChainId.MOONBEAM:
        return 'https://rpc.api.moonbeam.network';
      case ChainId.MOONRIVER:
        return 'https://rpc.api.moonriver.moonbeam.network';
      case ChainId.MUMBAI:
        return 'https://rpc-mumbai.maticvigil.com';
      case ChainId.POLYGON:
        return 'https://polygon.api.onfinality.io/public';
      case ChainId.MAINNET:
        return 'https://eth.meowrpc.com';
      default:
        throw new ChainIsNotSupportedException(chainId);
    }
  }
}
