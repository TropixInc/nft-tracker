import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QueueModule } from 'modules/queue/queue.module';
import { TokenEntity } from './entities/tokens.entity';
import { TokensService } from './tokens.service';
import { TokensController } from './tokens.controller';
import { TokenJobEntity } from './entities/tokens-jobs.entity';
import { TokenJobProcessor } from './queue/tokens-job.processor';
import { TokensJobsVerifyMintService } from './tokens-jobs-verify-mint.service';
import { TokensJobsService } from './tokens-jobs.service';
import { TokensJobsFetchMetadataService } from './tokens-jobs-fetch-metadata.service';
import { TokensJobsFetchOwnerAddressService } from './tokens-jobs-fetch-owner-address.service';
import { TokenAssetEntity } from './entities/tokens-assets.entity';
import { TokensJobsUploadAssetService } from './tokens-jobs-upload-asset.service';
import { TokensJobsRefreshTokenService } from './tokens-jobs-refresh-token.service';
import { ContractModule } from '../contracts/contract.module';
import { EvmModule } from '../blockchain/evm/evm.module';

@Module({
  imports: [
    QueueModule,
    TypeOrmModule.forFeature([TokenEntity, TokenJobEntity, TokenAssetEntity]),
    EvmModule.forRoot(),
    forwardRef(() => ContractModule),
  ],
  controllers: [TokensController],
  providers: [
    TokensService,
    TokensJobsService,
    TokensJobsVerifyMintService,
    TokensJobsFetchMetadataService,
    TokensJobsFetchOwnerAddressService,
    TokenJobProcessor,
    TokensJobsUploadAssetService,
    TokensJobsRefreshTokenService,
  ],
  exports: [TokensService, TokensJobsService],
})
export class TokensModule {}
