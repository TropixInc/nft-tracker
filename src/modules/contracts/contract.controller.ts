import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ContractService } from './contract.service';
import { TypedResponse } from 'src/common/decorators/typed-response.decorator';
import { ChainId } from 'src/common/enums';
import { AddressZero } from '@ethersproject/constants';
import { ContractAlreadyExistsException } from './exceptions';
import { CreateContractDto } from './dtos/create-contract.dto';
import { ContractModel } from './entities/contracts.entity';
import { ContractDto } from './dtos/contract-entity.dto';

@ApiTags('Contracts')
@Controller('contracts')
export class ContractController {
  constructor(private readonly service: ContractService) {}

  @ApiOperation({
    description: 'Create a new contract',
  })
  @TypedResponse(ContractDto, { status: HttpStatus.CREATED, description: 'Context created successfully' })
  @ApiException(() => [new ContractAlreadyExistsException(AddressZero, ChainId.POLYGON)])
  @Post()
  async create(@Body() dto: CreateContractDto): Promise<ContractModel | null> {
    return this.service.create(dto);
  }
}
