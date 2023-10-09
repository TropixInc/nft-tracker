import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isArray } from 'class-validator';
import { paginate } from 'nestjs-typeorm-paginate';
import { runTransaction } from 'src/common/helpers/transaction.helper';
import { DatabaseFunctionOptions, Optional } from 'src/common/interfaces';
import { FindOptionsWhere, ILike, In, Repository } from 'typeorm';
import { ContractNotFoundException } from '../contracts/exceptions';
import { ContractAddressTokensRequestDto } from './dtos/contract-address-tokens-request.dto';
import { NftByTokenRequestDto } from './dtos/nft-by-token-request.dto';
import { OwnerAddressTokensRequestDto } from './dtos/owner-address-tokens-request.dto';
import { TokenEntity, TokenModel } from './entities/tokens.entity';
import { TokenNotFoundException } from './exceptions';
import { Nft } from './interfaces';
import { NftsMapper } from './mappers/nfts.mapper';
import { TokensJobsService } from './tokens-jobs.service';

@Injectable()
export class TokensService {
  logger = new Logger(TokensService.name);

  constructor(
    @InjectRepository(TokenEntity)
    private repository: Repository<TokenEntity>,
    private tokensJobsService: TokensJobsService,
  ) {}

  findByAddressAndChainId(pagination: ContractAddressTokensRequestDto) {
    return paginate(
      this.repository,
      { page: pagination.page, limit: pagination.limit },
      {
        where: { address: ILike(pagination.contractAddress), chainId: pagination.chainId },
        order: { tokenId: 'ASC' },
        relations: {
          contract: true,
          asset: true,
        },
      },
    ).then((result) => ({
      ...result,
      items: NftsMapper.toMap(result.items),
    }));
  }

  findByOwnerAddressAndChainId(pagination: OwnerAddressTokensRequestDto) {
    const where: FindOptionsWhere<TokenEntity> = {
      chainId: pagination.chainId,
      ownerAddress: pagination.owner,
    };
    if (isArray(pagination.contractAddresses) && pagination.contractAddresses?.length > 0) {
      where.address = In(pagination.contractAddresses);
    }
    return paginate(
      this.repository,
      { page: pagination.page, limit: pagination.limit },
      {
        where,
        order: { tokenId: 'ASC' },
        relations: {
          contract: true,
          asset: true,
        },
      },
    ).then((result) => ({
      ...result,
      items: NftsMapper.toMap(result.items),
    }));
  }

  findOneByAddressAndChainId(
    address: string,
    chainId: number,
    opts?: { throwError: true } & DatabaseFunctionOptions,
  ): Promise<TokenModel>;
  findOneByAddressAndChainId(
    address: string,
    chainId: number,
    opts?: DatabaseFunctionOptions,
  ): Promise<TokenModel | null> {
    return runTransaction<TokenModel | null>(this.repository.manager, (queryRunner) => {
      const entity = queryRunner.manager.findOne(TokenEntity, { where: { address: ILike(address), chainId } });
      if (!entity && opts?.throwError) {
        throw new ContractNotFoundException(address, chainId);
      }
      return entity;
    });
  }

  async findByToken(request: NftByTokenRequestDto): Promise<Optional<Nft>> {
    if (request.refreshCache) {
      await this.tokensJobsService.createRefreshTokenJob({
        chainId: request.chainId,
        address: request.contractAddress,
        tokenId: request.tokenId,
        executeAt: new Date(),
      });
    }
    const token = await this.repository.findOne({
      where: { chainId: request.chainId, address: request.contractAddress, tokenId: request.tokenId },
      relations: {
        contract: true,
        asset: true,
      },
    });
    if (!token) {
      throw new TokenNotFoundException(request.contractAddress, request.chainId, request.tokenId);
    }
    return NftsMapper.toPublic(token);
  }
}
