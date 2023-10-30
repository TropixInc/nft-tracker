import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { ChainId } from 'src/common/enums';
import { ValidateChainId } from 'src/common/validators/chain-id.validator';
export class SyncBlockDto {
  @ApiProperty()
  @IsNumber()
  from: number;

  @ApiProperty()
  @IsNumber()
  to: number;

  @ValidateChainId({ optional: false })
  chainId: ChainId;
}
