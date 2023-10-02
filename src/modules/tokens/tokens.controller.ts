import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ContractAddressTokensRequestDto } from './dtos/contract-address-tokens-request.dto';
import { OwnerAddressTokensRequestDto } from './dtos/owner-address-tokens-request.dto';
import { TokensService } from './tokens.service';

@ApiTags('Nfts')
@Controller('nfts')
export class TokensController {
  constructor(private readonly service: TokensService) {}

  @ApiOperation({
    description: 'Find all tokens by contract address and chainId',
  })
  @Get('by-contract')
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
}
