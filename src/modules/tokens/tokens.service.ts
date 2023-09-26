import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isArray } from 'class-validator';
import { paginate } from 'nestjs-typeorm-paginate';
import { runTransaction } from 'src/common/helpers/transaction.helper';
import { DatabaseFunctionOptions } from 'src/common/interfaces';
import { FindOptionsWhere, ILike, In, Repository } from 'typeorm';
import { ERC721Provider } from '../blockchain/evm/providers/ERC721.provider';
import { ContractAddressTokensRequestDto } from './dtos/contract-address-tokens-request.dto';
import { OwnerAddressTokensRequestDto } from './dtos/owner-address-tokens-request.dto';
import { TokenEntity, TokenModel } from './entities/tokens.entity';
import { ContractNotFoundException } from './exceptions';
import { NftsMapper } from './mappers/nfts.mapper';

@Injectable()
export class TokensService {
  logger = new Logger(TokensService.name);

  constructor(
    @InjectRepository(TokenEntity)
    private repository: Repository<TokenEntity>,
    private eRC721Provider: ERC721Provider,
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
}
