import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEthereumAddress, Validate } from 'class-validator';
import { ChainId } from 'src/common/enums';
import { ValidateChainId } from 'src/common/validators/chain-id.validator';
import { AddressZero } from '@ethersproject/constants';

export class CreateContractDto {
  @ApiProperty({ type: String, description: 'Contract address', example: AddressZero })
  @IsEthereumAddress()
  @Validate((value: string) => value !== AddressZero, {
    message: 'Contract address cannot be zero address',
  })
  address: string;

  @ValidateChainId()
  chainId: ChainId;

  @ApiProperty({ type: Boolean, description: 'Cache media', example: true })
  @IsBoolean()
  cacheMedia: boolean;
}
