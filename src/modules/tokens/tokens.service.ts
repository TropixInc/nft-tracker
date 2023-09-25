import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import { runTransaction } from 'src/common/helpers/transaction.helper';
import { DatabaseFunctionOptions } from 'src/common/interfaces';
import { ILike, Repository } from 'typeorm';
import { ERC721Provider } from '../blockchain/evm/providers/ERC721.provider';
import { TokenEntity, TokenModel } from './entities/tokens.entity';
import { ContractNotFoundException } from './exceptions';
import { ContractAddressTokensPaginateDto } from './dtos/contract-address-tokens-paginate.dto';

@Injectable()
export class TokensService {
  logger = new Logger(TokensService.name);

  constructor(
    @InjectRepository(TokenEntity)
    private repository: Repository<TokenEntity>,
    private eRC721Provider: ERC721Provider,
  ) {}

  findByAddressAndChainId(pagination: ContractAddressTokensPaginateDto): Promise<Pagination<TokenModel>> {
    return paginate<TokenEntity>(
      this.repository,
      { page: pagination.page, limit: pagination.limit },
      {
        where: { address: ILike(pagination.contractAddress), chainId: pagination.chainId },
        order: { tokenId: 'ASC' },
      },
    );
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
