/* eslint-disable @typescript-eslint/no-inferrable-types */
import { IsDefined, IsEnum, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { ApiExtraModels, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { OrderByEnum } from '../enums/orderBy.enum';
import { IPaginationMeta } from 'nestjs-typeorm-paginate';
import { filterVoid } from 'common/helpers/object.helper';

export class PaginationDto {
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
  @Max(100)
  limit: number = 10;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  search: string = '';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  sortBy: string = '';

  @ApiPropertyOptional({ enum: OrderByEnum, default: OrderByEnum.DESC, enumName: 'OrderByEnum' })
  @IsOptional()
  @IsEnum(OrderByEnum)
  orderBy: OrderByEnum = OrderByEnum.DESC;
  getPagination() {
    return { limit: this.limit, page: this.page };
  }

  getNonVoid<T extends Record<string, any>>(override?: Partial<T>) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { limit, page, ...rest } = this;
    return filterVoid(Object.assign({}, rest, override));
  }
}

export class PaginationMetaDto implements IPaginationMeta {
  @ApiProperty({ type: 'number', example: 1 })
  itemCount: number;

  @ApiPropertyOptional({ type: 'number', example: 1 })
  totalItems?: number | undefined;

  @ApiProperty({ type: 'number', example: 1 })
  itemsPerPage: number;

  @ApiPropertyOptional({ type: 'number', example: 1 })
  totalPages?: number | undefined;

  @ApiProperty({ type: 'number', example: 1 })
  currentPage: number;
}

@ApiExtraModels(PaginationMetaDto)
export class PaginationBase {
  @ApiProperty({ type: PaginationMetaDto })
  @IsDefined({ each: true })
  meta: IPaginationMeta;
}
