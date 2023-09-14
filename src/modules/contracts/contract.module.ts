import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QueueModule } from 'modules/queue/queue.module';
import { ContractEntity } from './entities/contract.entity';
import { ContractService } from './contract.service';
import { ContractController } from './contract.controller';
import { BlockchainModule } from '../blockchain/blockchain.module';

@Module({
  imports: [QueueModule, TypeOrmModule.forFeature([ContractEntity]), BlockchainModule],
  controllers: [ContractController],
  providers: [ContractService],
  exports: [ContractService],
})
export class ContractModule {}
