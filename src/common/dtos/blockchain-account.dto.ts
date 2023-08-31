import { IsEthereumAddress } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ValidateChainId } from 'common/validators/chain-id.validator';
import { ChainId } from 'common/enums';

export class BlockchainAccountDTO {
  @ApiProperty({ example: '0x82dbB0A14F79f50c8f8e0D50FC9F1ef30Aeb6C79' })
  @IsEthereumAddress()
  address: string;

  @ApiProperty()
  @ValidateChainId()
  chainId: ChainId;
}
