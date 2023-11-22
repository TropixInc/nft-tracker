import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { JsonRpcProvider, Log } from 'ethers';
import { ChainId } from 'src/common/enums';
import { AppConfig } from 'src/config/app.config';
import { ConfigurationService } from 'src/modules/configuration/configuration.service';
import { ChainIsNotSupportedException } from '../exceptions';
import { GetLogs } from './interfaces';

@Injectable()
export class EvmLogsService {
  private jsonRpcProvidersPool = new Map<ChainId, JsonRpcProvider[]>();
  private readonly logger = new Logger(EvmLogsService.name);

  constructor(
    protected readonly configService: ConfigService<AppConfig>,
    protected readonly configurationService: ConfigurationService,
    @Inject(CACHE_MANAGER) protected readonly cacheManager: Cache,
  ) {}

  public async getLogs(chainId: ChainId, params: GetLogs): Promise<Log[]> {
    return await this.getLogsByFirstProvider(chainId, params);
  }

  private async getLogsByFirstProvider(chainId: ChainId, params: GetLogs): Promise<Log[]> {
    const providers = await this.getJsonRpcProviderByChainId(chainId);
    for (const provider of providers) {
      try {
        return await provider.getLogs(params);
      } catch (error) {
        continue;
      }
    }
    throw new Error('No provider available');
  }

  private async getJsonRpcProviderByChainId(chainId: ChainId, force?: boolean): Promise<JsonRpcProvider[]> {
    if (force || !this.jsonRpcProvidersPool.has(chainId)) {
      this.jsonRpcProvidersPool.get(chainId)?.forEach((provider) => provider.removeAllListeners());

      const providers: JsonRpcProvider[] = [];
      const uris = await this.getRPCUrlOnConfigurationOrDefault(chainId);
      for (const uri of uris) {
        const provider = new JsonRpcProvider(uri);
        providers.push(provider);
      }
      this.jsonRpcProvidersPool.set(chainId, providers);
      return providers;
    }
    return this.jsonRpcProvidersPool.get(chainId)!;
  }

  private async getRPCUrlOnConfigurationOrDefault(chainId: number): Promise<string[]> {
    const evm = await this.configurationService.get('EVM_LOGS');
    return evm?.find((item) => item.chainId === chainId)?.rpc || this.getRPCUrl(chainId);
  }

  private getRPCUrl(chainId: number): string[] {
    switch (chainId) {
      case ChainId.LOCALHOST:
        return [`http://localhost:8545`];
      case ChainId.MOONBEAM:
        return ['https://moonbeam.unitedbloc.com'];
      case ChainId.MOONRIVER:
        return ['https://moonriver.unitedbloc.com'];
      case ChainId.MUMBAI:
        return ['https://rpc-mumbai.maticvigil.com'];
      case ChainId.POLYGON:
        return [
          'https://polygon-rpc.com',
          'https://1rpc.io/matic',
          'https://polygon.llamarpc.com',
          'https://endpoints.omniatech.io/v1/matic/mainnet/public',
          'https://polygon-pokt.nodies.app',
        ];
      case ChainId.MAINNET:
        return ['https://eth.meowrpc.com'];
      default:
        throw new ChainIsNotSupportedException(chainId);
    }
  }
}
