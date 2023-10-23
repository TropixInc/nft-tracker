import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isString } from 'lodash';
import { Not, Repository } from 'typeorm';
import { TokenTransferEntity } from './entities/tokens-transfer.entity';
import { TokenEntity } from './entities/tokens.entity';
import { TokenHistoryParams } from './interfaces';

@Injectable()
export class TokensTransferService {
  private logger = new Logger(TokensTransferService.name);
  constructor(
    @InjectRepository(TokenTransferEntity)
    private readonly repository: Repository<TokenTransferEntity>,
    @InjectRepository(TokenEntity)
    private readonly tokenRepository: Repository<TokenEntity>,
  ) {}

  async createHistory(params: TokenHistoryParams): Promise<void> {
    const historyByTransaction = await this.getHistoryByTransactionHash(params);
    const alreadyExists = historyByTransaction.some((tx) => tx.transactionIndex === params.transactionIndex);
    if (alreadyExists) {
      this.logger.warn(`Token transfer history already exists: ${params.transactionHash}:${params.transactionIndex}`);
      return Promise.resolve();
    }
    await this.repository.save({
      address: params.address.toLowerCase(),
      chainId: params.chainId,
      fromAddress: params.args.from,
      toAddress: params.args.to,
      tokenId: params.args.tokenId.toBigInt().toString(),
      blockNumber: params.blockNumber,
      transactionHash: params.transactionHash,
      transactionIndex: params.transactionIndex,
      transferredAt: new Date(params.timestamp * 1000),
    });
    const ownerAddress = params.args.to?.toLowerCase();
    const isIndexIsGreaterOtherRegistered =
      historyByTransaction.some((tx) => tx.transactionIndex > params.transactionIndex) === false;
    if (isString(ownerAddress) && isIndexIsGreaterOtherRegistered) {
      await this.tokenRepository.update(
        {
          address: params.address.toLowerCase(),
          chainId: params.chainId,
          tokenId: params.args.tokenId.toBigInt().toString(),
          ownerAddress: Not(ownerAddress),
        },
        {
          ownerAddress: ownerAddress,
          lastOwnerAddressChangeAt: new Date(),
        },
      );
    }
  }

  async getHistoryByTransactionHash(params: TokenHistoryParams): Promise<TokenTransferEntity[]> {
    return this.repository.find({
      where: {
        address: params.address.toLowerCase(),
        chainId: params.chainId,
        tokenId: params.args.tokenId.toBigInt().toString(),
        transactionHash: params.transactionHash,
      },
    });
  }
}
