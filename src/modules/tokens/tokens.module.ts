import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QueueModule } from 'modules/queue/queue.module';
import { TokenEntity } from './entities/tokens.entity';
import { TokensService } from './tokens.service';
import { TokensController } from './tokens.controller';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { TokenJobEntity } from './entities/tokens-jobs.entity';
import { TokenJobProcessor } from './queue/tokens-job.processor';
import { TokensJobsVerifyMintService } from './tokens-jobs-verify-mint.service';
import { TokensJobsService } from './tokens-jobs.service';
import { TokensJobsFetchMetadataService } from './tokens-jobs-fetch-metadata.service';

@Module({
  imports: [QueueModule, TypeOrmModule.forFeature([TokenEntity, TokenJobEntity]), BlockchainModule],
  controllers: [TokensController],
  providers: [
    TokensService,
    TokensJobsService,
    TokensJobsVerifyMintService,
    TokensJobsFetchMetadataService,
    TokenJobProcessor,
  ],
  exports: [TokensService, TokensJobsService],
})
export class TokensModule {}
