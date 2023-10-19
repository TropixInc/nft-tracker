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
import { Log, id } from 'ethers';
import { EVENT_TRANSFER } from './constants';
import { ContractService } from 'src/modules/contracts/contract.service';
import { asyncPaginateRawAndEntities } from 'src/common/helpers/iterator.helper';

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
  ) {}

  async onModuleInit() {
    await this.syncLocalCache();
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
      const provider = await this.evmService.getJsonRpcProviderByChainId(chainId);
      const logs = await provider.getLogs({ fromBlock: blockNumber, toBlock: blockNumber });
      await this.processLogs(chainId, logs);
    } catch (error) {
      this.logger.error(`Error on block ${blockNumber} on chain ${chainId}`);
      this.logger.error(error);
      throw error;
    }
  }

  private unsubscribe(chainId: ChainId) {
    this.subscribeChainId.delete(chainId);
  }

  private async enqueueBlockSync(chainId: ChainId, blockNumber: number, confirmations: number) {
    try {
      const blockToSync = blockNumber - confirmations;
      this.logger.debug(`[${chainId}] Block mined ${blockNumber} to sync ${blockToSync}`);
      await this.eventsQueue.add(
        EvmEventsJobs.SyncBlock,
        {
          blockNumber: blockToSync,
          chainId,
        },
        {
          jobId: `${EvmEventsJobs.SyncBlock}:${chainId}:${blockNumber}`,
          backoff: {
            type: 'fixed',
            delay: 15 * 1000,
          },
          attempts: Number.MAX_SAFE_INTEGER,
        },
      );
    } catch (error) {
      this.logger.error(error.message, error.stack);
    }
  }

  @LoggerContext({ logError: true })
  private async processLogs(chainId: ChainId, logs: Log[]): Promise<Log[]> {
    return logs.filter(
      (event) => !event.removed && this.topicPool.has(this.getTopicKey(event.topics[0], event.address, chainId)),
    );
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
}
