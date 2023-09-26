import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { ChainId } from 'src/common/enums';
import { ValidateChainId } from 'src/common/validators/chain-id.validator';

export class ContractAddressTokensRequestDto {
  @ApiProperty({
    description: 'Contract address',
    example: '0x0',
    type: String,
  })
  @IsString()
  contractAddress: string;

  @ValidateChainId()
  chainId: ChainId;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : 1))
  @IsNumber()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : 10))
  @IsNumber()
  @Min(1)
  @Max(50)
  limit: number = 10;
}
