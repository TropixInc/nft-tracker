import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChainId } from 'src/common/enums';
import { AppConfig } from 'src/config/app.config';
import { BigNumberish, ethers, formatUnits, JsonRpcProvider, Network, WebSocketProvider } from 'ethers';
import { ChainIsNotSupportedException } from '../exceptions';
import { ConfigurationService } from 'src/modules/configuration/configuration.service';
import { LoggerContext } from 'src/common/decorators/logger-context.decorator';
import { Optional } from 'src/common/interfaces';
import * as ws from 'ws';
import { cacheResolver } from 'src/common/helpers/cache.helper';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class EvmService {
  logger = new Logger(EvmService.name);

  private jsonRpcProvidersPool = new Map<ChainId, JsonRpcProvider>();
  private webSocketProvidersPool = new Map<ChainId, WebSocketProvider>();
  constructor(
    protected readonly configService: ConfigService<AppConfig>,
    protected readonly configurationService: ConfigurationService,
    @Inject(CACHE_MANAGER) protected readonly cacheManager: Cache,
  ) {}

  public async getContractAt<T>(address: string, chainId: ChainId, abi: string[]): Promise<T> {
    return new ethers.Contract(address, abi, await this.getJsonRpcProviderByChainId(chainId)) as T;
  }

  public async getBlockNumber(chainId: ChainId) {
    const provider = await this.getJsonRpcProviderByChainId(chainId);
    return provider.getBlockNumber();
  }

  @LoggerContext({ logError: true })
  public async getJsonRpcProviderByChainId(chainId: ChainId, force?: boolean): Promise<JsonRpcProvider> {
    if (force || !this.jsonRpcProvidersPool.has(chainId)) {
      this.jsonRpcProvidersPool.get(chainId)?.removeAllListeners();
      const uri = await this.getRPCUrlOnConfigurationOrDefault(chainId);
      const network = Network.from({
        chainId: +chainId,
        name: ChainId[chainId].toLocaleLowerCase(),
      });
      const provider = new JsonRpcProvider(uri, network, { staticNetwork: network });
      this.jsonRpcProvidersPool.set(chainId, provider);
      return provider;
    }
    return this.jsonRpcProvidersPool.get(chainId)!;
  }

  @LoggerContext({ logError: true })
  public async getWebSocketProviderByChainId(chainId: ChainId, force?: boolean): Promise<Optional<WebSocketProvider>> {
    const exists = this.webSocketProvidersPool.has(chainId);
    if (!force && exists) {
      return this.webSocketProvidersPool.get(chainId)!;
    }

    if (force && exists) {
      this.webSocketProvidersPool.get(chainId)?.removeAllListeners();
      await this.webSocketProvidersPool.get(chainId)?.destroy();
    }
    const uri = await this.getWssUrlOnConfigurationOrDefault(chainId);
    if (!uri) return null;
    const provider = new WebSocketProvider(uri, chainId);
    await provider.ready;

    this.webSocketProvidersPool.set(chainId, provider);
    return provider;
  }

  public async getBlockchainCheckedProviders() {
    const statusWs = await this.checkAllWsProviders();
    const statusHttp = await this.checkAllJsonRpcProviders();
    return { statusHttp, statusWs };
  }

  async getBlock(chainId: number, blockNumber: number) {
    this.logger.log(`[${chainId}] calling getBlock for '${blockNumber}'`);
    return await cacheResolver(
      this.cacheManager,
      `getBlock:${chainId}:${blockNumber}`,
      async () => {
        this.logger.log(`[${chainId}] calling getBlock not cached '${blockNumber}'`);
        const provider = await this.getJsonRpcProviderByChainId(chainId);
        const block = await provider.getBlock(blockNumber);
        if (!block) throw new Error(`Block ${blockNumber} not found`);
        const format = (v: BigNumberish) => formatUnits(v, 'gwei');
        this.logger.log(`[${chainId}] calling getBlock done for '${blockNumber}'`);
        return {
          hash: block.hash,
          parentHash: block.parentHash,
          number: block.number,
          timestamp: block.timestamp,
          nonce: block.nonce,
          difficulty: block.difficulty?.toString(),
          gasLimit: format(block.gasLimit),
          gasUsed: format(block.gasUsed),
          miner: block.parentHash,
          extraData: block.extraData,
          baseFeePerGas: block.baseFeePerGas ? format(block.baseFeePerGas) : block.baseFeePerGas?.toString(),
        };
      },
      { ttl: 60 },
    );
  }

  private async checkAllWsProviders() {
    const data = {
      ready: true,
      chains: [] as { name: ChainId; state: boolean }[],
    };
    const providers = await this.getWebSocketProviders();
    for await (const [chain, provider] of providers) {
      const state = provider.websocket.readyState;
      const ready = state === ws.OPEN || state === ws.CONNECTING;
      data.chains.push({
        name: chain,
        state: ready,
      });
      data.ready = ready ? data.ready : false;
    }

    data.ready = data.chains.length ? data.ready : false;
    return data;
  }

  private async checkAllJsonRpcProviders() {
    const data = {
      ready: true,
      chains: [] as { name: ChainId; state: boolean; blockNumber: number }[],
    };
    const providers = await this.getJsonRpcProviders();
    await Promise.all(
      providers.map(async ([chain, provider]) => {
        const blockNumber: number = await provider.getBlockNumber().catch(() => {
          return 0;
        });

        const isReady = blockNumber > 0;

        data.chains.push({
          name: chain,
          state: isReady,
          blockNumber,
        });
        data.ready = isReady ? data.ready : false;
      }),
    );

    data.ready = data.chains.length ? data.ready : false;
    return data;
  }

  private async getJsonRpcProviders() {
    if (this.supportedChainIds().length > 0) {
      // Load all providers
      await Promise.all(
        this.supportedChainIds().map(async (chainId) => {
          await this.getJsonRpcProviderByChainId(chainId);
        }),
      );
    }

    return Array.from(this.jsonRpcProvidersPool.entries());
  }

  private async getWebSocketProviders() {
    if (this.supportedChainIds().length > 0) {
      // Load all providers
      await Promise.all(
        this.supportedChainIds().map(async (chainId) => {
          await this.getWebSocketProviderByChainId(chainId);
        }),
      );
    }

    return Array.from(this.webSocketProvidersPool.entries());
  }

  public supportedChainIds(): ChainId[] {
    return this.configService.get<AppConfig['chain_ids']>('chain_ids') as ChainId[];
  }

  public supportChainId(chainId: ChainId): boolean {
    return this.supportedChainIds().includes(chainId);
  }

  public async getMinimumTransactionConfirmation(chainId: ChainId): Promise<number> {
    const evm = await this.configurationService.get('EVM');
    return evm?.find((item) => item.chainId === chainId)?.confirmation || 12;
  }

  private async getWssUrlOnConfigurationOrDefault(chainId: number): Promise<Optional<string>> {
    const evm = await this.configurationService.get('EVM');
    return evm?.find((item) => item.chainId === chainId)?.wss || this.getWssUrl(chainId);
  }

  private getWssUrl(chainId: number): Optional<string> {
    switch (chainId) {
      case ChainId.LOCALHOST:
        return `wss://localhost:8545`;
      case ChainId.MOONBEAM:
        return 'wss://moonbeam.unitedbloc.com';
      case ChainId.MOONRIVER:
        return 'wss://moonriver.unitedbloc.com';
      case ChainId.MUMBAI:
        return '';
      case ChainId.POLYGON:
        return 'wss://polygon.api.onfinality.io/public-ws';
      case ChainId.MAINNET:
        return 'wss://ethereum.publicnode.com';
      default:
        throw new ChainIsNotSupportedException(chainId);
    }
  }

  private async getRPCUrlOnConfigurationOrDefault(chainId: number) {
    const evm = await this.configurationService.get('EVM');
    return evm?.find((item) => item.chainId === chainId)?.rpc || this.getRPCUrl(chainId);
  }

  private getRPCUrl(chainId: number) {
    switch (chainId) {
      case ChainId.LOCALHOST:
        return `http://localhost:8545`;
      case ChainId.MOONBEAM:
        return 'https://moonbeam.unitedbloc.com';
      case ChainId.MOONRIVER:
        return 'https://moonriver.unitedbloc.com';
      case ChainId.MUMBAI:
        return 'https://rpc-mumbai.maticvigil.com';
      case ChainId.POLYGON:
        return 'https://polygon-rpc.com';
      case ChainId.MAINNET:
        return 'https://eth.meowrpc.com';
      default:
        throw new ChainIsNotSupportedException(chainId);
    }
  }
}
