import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsObject, IsOptional, IsString, IsUppercase, Matches } from 'class-validator';
import { JsonPrimitive } from 'type-fest';
import { Configuration } from '../interfaces';

export class CreateConfigurationDto implements Partial<Configuration> {
  @ApiProperty({
    required: true,
    example: 'ETH_ADDRESS',
  })
  @IsNotEmpty()
  @IsString()
  @IsUppercase()
  @Matches(/^[A-Z]+(?:_[A-Z]+)*$/)
  key: string;

  @ApiPropertyOptional({
    description: 'Value can be any JSON value',
    example: '590',
  })
  @IsOptional()
  value: JsonPrimitive | Record<string, any> | null = null;

  @ApiPropertyOptional({
    description: 'Schema',
    example: '{ "type": "integer" }',
    default: {},
  })
  @IsOptional()
  @IsObject()
  schema: Record<string, any> = {};

  @ApiPropertyOptional({
    description: 'Active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  active = true;
}
