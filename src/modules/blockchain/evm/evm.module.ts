import { DynamicModule, Provider } from '@nestjs/common';
import { QueueModule } from 'modules/queue/queue.module';
import { EvmService } from './evm.service';
import { EvmEventsService } from './evm-events.services';
import { ERC721Provider } from './providers/ERC721.provider';
import { isWatcher } from 'src/config/app.config';
import { EvmEventsWatcher } from './queue/evm-events-watcher.processor';

export class EvmModule {
  static forRoot(): DynamicModule {
    const providers: Provider<any>[] = [EvmService, ERC721Provider, EvmEventsService];
    isWatcher() && providers.push(EvmEventsWatcher);
    return {
      module: EvmModule,
      imports: [QueueModule],
      controllers: [],
      providers: providers,
      exports: providers,
    };
  }
}
