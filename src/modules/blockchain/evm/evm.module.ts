import { forwardRef, Module, Provider } from '@nestjs/common';
import { QueueModule } from 'modules/queue/queue.module';
import { ContractModule } from 'src/modules/contracts/contract.module';
import { TokensModule } from 'src/modules/tokens/tokens.module';
import { EvmEventsService } from './evm-events.services';
import { EvmService } from './evm.service';
import { ERC721Provider } from './providers/ERC721.provider';
import { EvmEventsWatcher } from './queue/evm-events-watcher.processor';
import { EvmEventsProcessor } from './queue/evm-events-worker.processor';
import { EvmLogsService } from './evm-logs.service';

const providers: Provider<any>[] = [
  EvmService,
  ERC721Provider,
  EvmEventsService,
  EvmEventsProcessor,
  EvmEventsWatcher,
  EvmLogsService,
];
@Module({
  imports: [QueueModule, forwardRef(() => ContractModule), forwardRef(() => TokensModule)],
  controllers: [],
  providers: providers,
  exports: providers,
})
export class EvmModule {}
