import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as ws from 'ws';
import { LoggerContext } from 'src/common/decorators/logger-context.decorator';
import { EvmService } from './evm.service';
import { ChainId } from 'src/common/enums';
import { isWatcher } from 'src/config/app.config';

@Injectable()
export class EvmEventsService {
  private readonly logger = new Logger(EvmEventsService.name);

  private subscribeChainId = new Map<ChainId, boolean>();

  constructor(private readonly evmService: EvmService) {}
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
      // if (provider.websocket.readyState !== ws.OPEN && provider.websocket.readyState !== ws.CONNECTING) {
      // if (provider.websocket.readyState !== ws.OPEN) {
      this.logger.warn(`[${chainId}] websocket.readyState ${provider!.websocket.readyState}`);
      // }
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

  private unsubscribe(chainId: ChainId) {
    this.subscribeChainId.delete(chainId);
  }

  private async enqueueBlockSync(chainId: ChainId, blockNumber: number, confirmations: number) {
    try {
      const blockToSync = blockNumber - confirmations;
      this.logger.debug(`[${chainId}] Block mined ${blockNumber} to sync ${blockToSync}`);
    } catch (error) {
      this.logger.error(error.message, error.stack);
    }
  }
}
