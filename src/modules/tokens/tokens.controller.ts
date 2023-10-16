import { AddressZero } from '@ethersproject/constants';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TypedResponse } from 'src/common/decorators/typed-response.decorator';
import { ChainId } from 'src/common/enums';
import { ContractNotFoundException } from '../contracts/exceptions';
import { ContractAddressTokensRequestDto } from './dtos/contract-address-tokens-request.dto';
import { NftByTokenRequestDto } from './dtos/nft-by-token-request.dto';
import { NftPaginateResponseDto } from './dtos/nft-reponse.dto';
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
  @TypedResponse(NftPaginateResponseDto, { status: HttpStatus.OK })
  @ApiException(() => [new ContractNotFoundException(AddressZero, ChainId.POLYGON)])
  async findByAddressAndChainId(@Query() pagination: ContractAddressTokensRequestDto) {
    return this.service.findByAddressAndChainId(pagination);
  }

  @ApiOperation({
    description: 'Find one token by owner address and chainId',
  })
  @Get('by-owner')
  @TypedResponse(NftPaginateResponseDto, { status: HttpStatus.OK })
  async findByOwnerAddressAndChainId(@Query() pagination: OwnerAddressTokensRequestDto) {
    return this.service.findByOwnerAddressAndChainId(pagination);
  }

  @ApiOperation({
    description: 'Find all tokens by contract address and chainId',
  })
  @Get('by-token')
  @TypedResponse(NftPaginateResponseDto, { status: HttpStatus.OK })
  @ApiException(() => [new TokenNotFoundException(AddressZero, ChainId.POLYGON, '1')])
  async findByToken(@Query() request: NftByTokenRequestDto) {
    return this.service.findByToken(request);
  }
}
