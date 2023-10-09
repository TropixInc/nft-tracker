import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ChainId } from 'src/common/enums';
import { Optional } from 'src/common/interfaces';
import { ValidateChainId } from 'src/common/validators/chain-id.validator';

export class NftByTokenRequestDto {
  @ApiProperty({
    description: 'Contract address',
    example: '0x0',
    type: String,
  })
  @IsString()
  contractAddress: string;

  @ValidateChainId()
  chainId: ChainId;

  @ApiProperty({
    description: 'Token id',
    example: '1',
    type: String,
  })
  @IsString()
  tokenId: string;

  @ApiPropertyOptional({
    description: 'Refresh cache',
    example: false,
    type: Boolean,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    return [true, 'enabled', 'true'].indexOf(value) > -1;
  })
  refreshCache?: Optional<boolean>;
}
