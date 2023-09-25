import { Controller, Get, Query } from '@nestjs/common';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TokensService } from './tokens.service';
import { ChainId } from 'src/common/enums';
import { AddressZero } from '@ethersproject/constants';
import { ContractAlreadyExistsException } from './exceptions';
import { TokenModel } from './entities/tokens.entity';
import { Pagination } from 'nestjs-typeorm-paginate';
import { ContractAddressTokensPaginateDto } from './dtos/contract-address-tokens-paginate.dto';

@ApiTags('Nfts')
@Controller('nfts')
export class TokensController {
  constructor(private readonly service: TokensService) {}

  @ApiOperation({
    description: 'Find all tokens by contract address and chainId',
  })
  @ApiException(() => [new ContractAlreadyExistsException(AddressZero, ChainId.POLYGON)])
  @Get('by-contract')
  async findByAddressAndChainId(
    @Query() pagination: ContractAddressTokensPaginateDto,
  ): Promise<Pagination<TokenModel>> {
    return this.service.findByAddressAndChainId(pagination);
  }
}
