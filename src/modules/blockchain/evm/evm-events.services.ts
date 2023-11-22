import { forwardRef, Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as ws from 'ws';
import { LoggerContext } from 'src/common/decorators/logger-context.decorator';
import { EvmService } from './evm.service';
import { ChainId } from 'src/common/enums';
import { isWatcher } from 'src/config/app.config';
import { EvmEventsJobs, LocalQueueEnum } from 'src/modules/queue/enums';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Log, id, Interface, LogDescription } from 'ethers';
import { EVENT_TRANSFER } from './constants';
import { ContractService } from 'src/modules/contracts/contract.service';
import { asyncPaginateRawAndEntities } from 'src/common/helpers/iterator.helper';
import { Nullable } from 'src/common/interfaces';
import { LogParsed } from './interfaces';
import { Format } from './utils/format';
import { parallel } from 'radash';
import { TokensTransferService } from 'src/modules/tokens/tokens-transfer.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { range } from 'lodash';
import { SyncBlockDto } from './dto/sync-block.dto';
import { EvmLogsService } from './evm-logs.service';

@Injectable()
export class EvmEventsService implements OnModuleInit {
  private readonly logger = new Logger(EvmEventsService.name);

  private subscribeChainId = new Map<ChainId, boolean>();
  private topicPool = new Map<string, boolean>();

  constructor(
    private readonly evmService: EvmService,
    @InjectQueue(LocalQueueEnum.EvmEvents) private eventsQueue: Queue,
    @Inject(forwardRef(() => ContractService))
    private readonly contractService: ContractService,
    @Inject(forwardRef(() => TokensTransferService))
    private readonly tokenTransferService: TokensTransferService,
    @Inject(CACHE_MANAGER) protected readonly cacheManager: Cache,
    private readonly evmLogsService: EvmLogsService,
  ) {}

  async onModuleInit() {
    await this.syncLocalCache();
    this.getLogsByChainIdAndBlockNumber(ChainId.MOONBEAM, 4924160);
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  @LoggerContext({ logError: true })
  async checkingIfSocketConnectionIsStillOpen() {
    this.logger.verbose(`Checking if socket connection is still open...`);

    for await (const chainId of this.evmService.supportedChainIds()) {
      let provider = await this.evmService.getWebSocketProviderByChainId(chainId);

      if (!provider) {
        continue;
      }

      if (provider.websocket.readyState === ws.CLOSED) {
        this.logger.warn(`[${chainId}] WebSocket connection is closed for chain`);
        this.unsubscribe(chainId);

        provider = await this.evmService.getWebSocketProviderByChainId(chainId, true);
        await this.subscribeBlockNumberByChainId(chainId);

        this.logger.warn(
          `[${chainId}] WebSocket connection was recreated for chain with status ${provider!.websocket.readyState}`,
        );
      }
      if (provider!.websocket.readyState !== ws.OPEN && provider!.websocket.readyState !== ws.CONNECTING) {
        this.logger.warn(`[${chainId}] websocket.readyState ${provider!.websocket.readyState}`);
      }
    }
  }

  async subscribeBlockNumberByChainId(chainId: ChainId): Promise<void> {
    try {
      if (!isWatcher()) return Promise.resolve();
      if (this.subscribeChainId.has(chainId)) {
        return this.logger.log(`[${chainId}] Already listener chain `);
      }

      this.subscribeChainId.set(chainId, true);
      this.logger.log(`[${chainId}] Receive subscribe chain`);

      const provider = await this.evmService.getWebSocketProviderByChainId(chainId);
      if (!provider) return Promise.resolve();

      const confirmations = await this.evmService.getMinimumTransactionConfirmation(chainId);
      this.logger.log(`[${chainId}] Waiting ${confirmations} chain`);
      provider.on('block', (blockNumber) => {
        this.enqueueBlockSync(chainId, blockNumber, confirmations).catch((error) =>
          this.logger.error(error.message, error.stack, 'enqueueBlockSync'),
        );
      });
    } catch (error) {
      this.unsubscribe(chainId);
      this.logger.error(error);
      throw error;
    }
  }

  async getLogsByChainIdAndBlockNumber(chainId: ChainId, blockNumber: number) {
    try {
      this.logger.verbose(`Get log ${blockNumber} on chain ${chainId}`);
      const logs = await this.evmLogsService.getLogs(chainId, { fromBlock: blockNumber, toBlock: blockNumber });
      const block = await this.evmService.getBlock(chainId, blockNumber);
      const logsProcessed = await this.processLogs(chainId, logs, block.timestamp);
      parallel(5, logsProcessed, async (log) => {
        await this.tokenTransferService.createHistory({
          chainId,
          ...log,
        });
      });
    } catch (error) {
      this.logger.error(`Error on block ${blockNumber} on chain ${chainId}`);
      throw error;
    }
  }

  @LoggerContext({ logError: true })
  async processPreviousBlocks(chainId) {
    const currentBlockNumber = await this.evmService.getBlockNumber(chainId);
    const lastBlockSync = (await this.getLatestBlockNumberSync(chainId)) || currentBlockNumber;

    this.logger.log(`[${chainId}] Block lasted ${lastBlockSync} and current ${currentBlockNumber}`);
    await this.syncBlock({
      to: currentBlockNumber,
      from: lastBlockSync,
      chainId,
    });
  }

  async syncBlock(dto: SyncBlockDto) {
    this.logger.log(`Sync block ${JSON.stringify(dto)}`);
    const minimumTransactionConfirmation = await this.evmService.getMinimumTransactionConfirmation(dto.chainId);
    for await (const blockNumber of range(dto.from, dto.to)) {
      if (blockNumber <= 0) {
        continue;
      }
      await this.enqueueBlockSync(dto.chainId, blockNumber, minimumTransactionConfirmation);
    }
  }

  async getLatestBlockNumberSync(chainId: ChainId): Promise<number | null> {
    const lastBlockNumber = await this.cacheManager.get<number>(this.formatKeyLastedBlockNumber(chainId));
    return lastBlockNumber ? lastBlockNumber : null;
  }

  async saveLastBlockNumberSync(chainId: ChainId, blockNumber: number) {
    const lastBlockNumber = await this.getLatestBlockNumberSync(chainId);
    if (lastBlockNumber === null || lastBlockNumber < blockNumber) {
      await this.cacheManager.set(this.formatKeyLastedBlockNumber(chainId), blockNumber);
    } else {
      this.logger.warn(`[${chainId}] This block is ${blockNumber} is not greater than lasted ${lastBlockNumber}`);
    }
  }

  private formatKeyLastedBlockNumber(chainId: ChainId) {
    return `last-block-syc:${chainId}`;
  }

  private unsubscribe(chainId: ChainId) {
    this.subscribeChainId.delete(chainId);
  }

  private async enqueueBlockSync(chainId: ChainId, blockNumber: number, confirmations: number) {
    try {
      const blockToSync = blockNumber - confirmations;
      this.logger.verbose(`[${chainId}] Block mined ${blockNumber} to sync ${blockToSync}`);
      await this.eventsQueue.add(
        EvmEventsJobs.SyncBlock,
        {
          blockNumber: blockToSync,
          chainId,
        },
        {
          jobId: `${EvmEventsJobs.SyncBlock}:${chainId}:${blockNumber}`,
          removeOnComplete: true,
          removeOnFail: true,
        },
      );
    } catch (error) {
      this.logger.error(error.message, error.stack);
    }
  }

  @LoggerContext({ logError: true })
  private async processLogs(chainId: ChainId, logs: Log[], timestamp: number): Promise<LogParsed[]> {
    return logs
      .filter(
        (event) => !event.removed && this.topicPool.has(this.getTopicKey(event.topics[0], event.address, chainId)),
      )
      .map((event) => {
        const logParse = this.tryParseLog({
          topics: event.topics as string[],
          data: event.data,
        });
        if (!logParse || Number(logParse?.args?.length ?? 0) < 3) return null;
        const args = Format.from(logParse.args);
        return {
          address: event.address,
          blockHash: event.blockHash,
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
          transactionIndex: event.transactionIndex,
          signature: logParse.signature,
          name: logParse.name,
          topics: event.topics,
          topic: logParse.topic,
          args: {
            from: args[0],
            to: args[1],
            tokenId: args[2],
          },
          timestamp,
        };
      })
      .filter((event) => event !== null) as LogParsed[];
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  private async syncLocalCache() {
    const queryBuilder = await this.contractService.getAllContracts(true);
    for await (const contract of asyncPaginateRawAndEntities(queryBuilder)) {
      if (!contract) continue;
      this.topicPool.set(this.getTopicKey(id(EVENT_TRANSFER), contract.address, contract.chainId), true);
    }
  }

  private getTopicKey(topic: string, address: string, chainId: ChainId) {
    return `${topic}:${chainId}:${address?.toLowerCase()}`;
  }

  private tryParseLog(log: { topics: string[]; data: string }): Nullable<LogDescription> {
    try {
      const iface = new Interface([
        'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
        // TODO: when support ERC1155
        // 'event Transfer(address indexed from, address indexed to, uint256 value)',
      ]);
      if (!iface) return null;
      return iface.parseLog(log);
    } catch (error) {
      return null;
    }
  }
}
