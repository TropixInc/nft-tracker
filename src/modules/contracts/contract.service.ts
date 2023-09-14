import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { runTransaction } from 'src/common/helpers/transaction.helper';
import { DatabaseFunctionOptions } from 'src/common/interfaces';
import { ILike, Repository } from 'typeorm';
import { ERC721Provider } from '../blockchain/evm/providers/ERC721.provider';
import { CreateContractDto } from './dtos/create-contract.dto';
import { ContractEntity, ContractModel } from './entities/contract.entity';
import { ContractAlreadyExistsException, ContractNotFoundException } from './exceptions';

@Injectable()
export class ContractService {
  logger = new Logger(ContractService.name);

  constructor(
    @InjectRepository(ContractEntity)
    private repository: Repository<ContractEntity>,
    private eRC721Provider: ERC721Provider,
  ) {}

  async create(dto: CreateContractDto): Promise<ContractModel> {
    if (await this.findOneByAddressAndChainId(dto.address, dto.chainId)) {
      throw new ContractAlreadyExistsException(dto.address, dto.chainId);
    }
    const instance = await this.eRC721Provider.create(dto.address, dto.chainId);
    const contract = this.repository.create({
      address: dto.address,
      chainId: dto.chainId,
      cacheMedia: dto.cacheMedia,
      name: await instance.name(),
      symbol: await instance.symbol(),
      totalSupply: await instance.totalSupply(),
    });
    return this.repository.save(contract);
  }

  findOneByAddressAndChainId(
    address: string,
    chainId: number,
    opts?: { throwError: true } & DatabaseFunctionOptions,
  ): Promise<ContractModel>;
  findOneByAddressAndChainId(
    address: string,
    chainId: number,
    opts?: DatabaseFunctionOptions,
  ): Promise<ContractModel | null> {
    return runTransaction<ContractModel | null>(this.repository.manager, (queryRunner) => {
      const entity = queryRunner.manager.findOne(ContractEntity, { where: { address: ILike(address), chainId } });
      if (!entity && opts?.throwError) {
        throw new ContractNotFoundException(address, chainId);
      }
      return entity;
    });
  }
}
