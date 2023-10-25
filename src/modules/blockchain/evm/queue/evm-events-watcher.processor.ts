import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
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
    for await (const chainId of chains) {
      this.logger.log(`Create subscribe event: ${chainId}`);
      await this.eventsService.subscribeBlockNumberByChainId(chainId);
    }
  }
}
