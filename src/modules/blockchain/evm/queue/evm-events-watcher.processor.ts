import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { parallel } from 'radash';
import { isWatcher } from 'src/config/app.config';
import { EvmEventsService } from '../evm-events.services';
import { EvmService } from '../evm.service';

@Injectable()
export class EvmEventsWatcher implements OnModuleInit {
  readonly logger = new Logger(EvmEventsWatcher.name);

  constructor(
    private readonly eventsService: EvmEventsService,
    private readonly evmService: EvmService,
  ) {}
  async onModuleInit() {
    if (!isWatcher()) return Promise.resolve();
    const chains = this.evmService.supportedChainIds();
    parallel(2, chains, async (chainId) => {
      this.logger.log(`Create subscribe event: ${chainId}`);
      await this.eventsService.subscribeBlockNumberByChainId(chainId);
      await this.eventsService.processPreviousBlocks(chainId);
    });
  }
}
