import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChainId } from 'src/common/enums';
import { Optional } from 'src/common/interfaces';
import { Repository } from 'typeorm';
import { ERC721Provider } from '../blockchain/evm/providers/ERC721.provider';
import { TokenJobEntity } from './entities/tokens-jobs.entity';
import { TokenEntity } from './entities/tokens.entity';
import { TokenJobStatus, TokenJobType } from './enums';

@Injectable()
export class TokensJobsService {
  logger = new Logger(TokensJobsService.name);

  constructor(
    @InjectRepository(TokenEntity)
    private tokenRepository: Repository<TokenEntity>,
    @InjectRepository(TokenJobEntity)
    private tokenJobRepository: Repository<TokenJobEntity>,
    private eRC721Provider: ERC721Provider,
  ) {}

  createJob(params: {
    tokensIds: string[];
    tokensUris?: Optional<string[]>;
    address?: Optional<string>;
    chainId?: Optional<ChainId>;
    type: TokenJobType;
    assetUri?: Optional<string>;
    executeAt?: Optional<Date>;
  }): Promise<TokenJobEntity> {
    return this.tokenJobRepository.save({
      tokensIds: params.tokensIds,
      tokensUris: params.tokensUris,
      assetUri: params.assetUri,
      address: params.address,
      chainId: params.chainId,
      type: params.type,
      executeAt: params.executeAt ?? new Date(),
      status: TokenJobStatus.Created,
    });
  }
}
