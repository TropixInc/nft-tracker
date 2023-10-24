import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QueueModule } from 'modules/queue/queue.module';
import { ContractEntity } from './entities/contracts.entity';
import { ContractService } from './contract.service';
import { ContractController } from './contract.controller';
import { TokensModule } from '../tokens/tokens.module';
import { EvmModule } from '../blockchain/evm/evm.module';

@Module({
  imports: [
    QueueModule,
    TypeOrmModule.forFeature([ContractEntity]),
    forwardRef(() => EvmModule),
    forwardRef(() => TokensModule),
  ],
  controllers: [ContractController],
  providers: [ContractService],
  exports: [ContractService],
})
export class ContractModule {}
