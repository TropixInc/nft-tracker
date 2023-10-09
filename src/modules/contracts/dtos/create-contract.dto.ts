import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString, Validate } from 'class-validator';
import { ChainId } from 'src/common/enums';
import { ValidateChainId } from 'src/common/validators/chain-id.validator';
import { AddressZero } from '@ethersproject/constants';
import { AddressCannotZero } from 'src/common/validators/custom-validators';

export class CreateContractDto {
  @ApiProperty({ type: String, description: 'Contract address', example: AddressZero })
  @IsString()
  @Validate(AddressCannotZero, {
    message: 'Contract address cannot be zero address DDD',
  })
  address: string;

  @ValidateChainId()
  chainId: ChainId;

  @ApiProperty({ type: Boolean, description: 'Cache media', example: true })
  @IsBoolean()
  cacheMedia: boolean;
}
