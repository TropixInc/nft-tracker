import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QueueModule } from 'modules/queue/queue.module';
import { ContractEntity } from './entities/contract.entity';
import { ContractService } from './contract.service';
import { ContractController } from './contract.controller';

@Module({
  imports: [QueueModule, TypeOrmModule.forFeature([ContractEntity])],
  controllers: [ContractController],
  providers: [ContractService],
  exports: [ContractService],
})
export class ContractModule {}
