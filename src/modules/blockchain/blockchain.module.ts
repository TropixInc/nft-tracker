import { Module } from '@nestjs/common';
import { QueueModule } from 'modules/queue/queue.module';
import { EthereumService } from './evm/ethereum.service';
import { ERC721Provider } from './evm/providers/ERC721.provider';

const services = [EthereumService, ERC721Provider];

@Module({
  imports: [QueueModule],
  controllers: [],
  providers: [...services],
  exports: [...services],
})
export class BlockchainModule {}
