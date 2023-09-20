import { Controller, Get, Query } from '@nestjs/common';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TokensService } from './tokens.service';
import { ChainId } from 'src/common/enums';
import { AddressZero } from '@ethersproject/constants';
import { ContractAlreadyExistsException } from './exceptions';
import { TokenModel } from './entities/tokens.entity';
import { Pagination } from 'nestjs-typeorm-paginate';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@ApiTags('Tokens')
@Controller('tokens')
export class TokensController {
  constructor(private readonly service: TokensService) {}

  @ApiOperation({
    description: 'Find all tokens by address and chainId',
  })
  @ApiException(() => [new ContractAlreadyExistsException(AddressZero, ChainId.POLYGON)])
  @Get('/:address/:chainId')
  async findByAddressAndChainId(@Query() pagination: PaginationDto): Promise<Pagination<TokenModel>> {
    return this.service.findByAddressAndChainId(pagination);
  }
}
