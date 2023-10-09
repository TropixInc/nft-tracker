import { AddressZero } from '@ethersproject/constants';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ChainId } from 'src/common/enums';
import { ContractNotFoundException } from '../contracts/exceptions';
import { ContractAddressTokensRequestDto } from './dtos/contract-address-tokens-request.dto';
import { NftByTokenRequestDto } from './dtos/nft-by-token-request.dto';
import { OwnerAddressTokensRequestDto } from './dtos/owner-address-tokens-request.dto';
import { TokenNotFoundException } from './exceptions';
import { TokensService } from './tokens.service';

@ApiTags('Nfts')
@Controller('nfts')
export class TokensController {
  constructor(private readonly service: TokensService) {}

  @ApiOperation({
    description: 'Find all tokens by contract address and chainId',
  })
  @Get('by-contract')
  @ApiException(() => [new ContractNotFoundException(AddressZero, ChainId.POLYGON)])
  async findByAddressAndChainId(@Query() pagination: ContractAddressTokensRequestDto) {
    return this.service.findByAddressAndChainId(pagination);
  }

  @ApiOperation({
    description: 'Find one token by owner address and chainId',
  })
  @Get('by-owner')
  async findByOwnerAddressAndChainId(@Query() pagination: OwnerAddressTokensRequestDto) {
    return this.service.findByOwnerAddressAndChainId(pagination);
  }

  @ApiOperation({
    description: 'Find all tokens by contract address and chainId',
  })
  @Get('by-token')
  @ApiException(() => [new TokenNotFoundException(AddressZero, ChainId.POLYGON, '1')])
  async findByToken(@Query() request: NftByTokenRequestDto) {
    return this.service.findByToken(request);
  }
}
