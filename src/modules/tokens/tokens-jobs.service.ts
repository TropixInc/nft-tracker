import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChainId } from 'src/common/enums';
import { Optional } from 'src/common/interfaces';
import { Repository } from 'typeorm';
import { TokenJobEntity } from './entities/tokens-jobs.entity';
import { TokenJobStatus, TokenJobType } from './enums';

@Injectable()
export class TokensJobsService {
  logger = new Logger(TokensJobsService.name);

  constructor(
    @InjectRepository(TokenJobEntity)
    private tokenJobRepository: Repository<TokenJobEntity>,
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
      attempts: 0,
    });
  }

  async createRefreshTokenJob(params: {
    tokenId: string;
    address?: Optional<string>;
    chainId?: Optional<ChainId>;
    executeAt?: Optional<Date>;
  }): Promise<TokenJobEntity> {
    const job = await this.tokenJobRepository
      .createQueryBuilder()
      .where('address ilike :address', {
        address: params.address,
      })
      .andWhere('chain_id = :chainId', { chainId: params.chainId })
      .andWhere("status IN ('created', 'started')")
      .andWhere('type = :type', { type: TokenJobType.RefreshToken })
      .andWhere(':tokenId::text = ANY (tokens_ids)', { tokenId: params.tokenId })
      .getOne();
    if (job) {
      return job;
    }
    return await this.createJob({
      chainId: params.chainId,
      address: params.address,
      tokensIds: [params.tokenId],
      tokensUris: [],
      executeAt: params.executeAt,
      type: TokenJobType.RefreshToken,
    });
  }
}
