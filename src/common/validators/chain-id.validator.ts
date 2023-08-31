import { applyDecorators, Injectable } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional, ApiPropertyOptions } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsInt,
  isNumber,
  IsOptional,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { getAppConfig } from 'config/app.config';
import { ChainId } from 'common/enums';

export const splitClear = <T = any>(value: string): T[] =>
  (value ?? '').split(',').map<T>((level: any) => level.trim());

@Injectable()
@ValidatorConstraint({ name: 'isChainId', async: true })
export class IsChainId implements ValidatorConstraintInterface {
  supportedIds: number[] = [];
  constructor() {
    this.supportedIds = getAppConfig().chain_ids.map((chain) => +chain);
  }

  validate(value: string) {
    return this.supportedIds.includes(Number(value));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  defaultMessage(args: ValidationArguments) {
    return `Unsupported chain id`;
  }
}

export function ValidateChainId({ optional }: { optional?: boolean } = { optional: false }) {
  const decorators = [Transform(({ value }) => parseInt(value)), IsInt(), Validate(IsChainId)];
  const opts: ApiPropertyOptions = {
    default: ChainId.POLYGON,
    example: ChainId.POLYGON,
    type: 'number',
    enum: Object.fromEntries(
      Object.entries(ChainId)
        .filter(([, v]) => isNumber(v))
        .map(([k, v]) => [k, v.toString()]),
    ),
    enumName: 'ChainId',
  };

  if (optional) {
    decorators.push(IsOptional(), ApiPropertyOptional({ ...opts, required: false }));
  } else {
    decorators.push(ApiProperty({ ...opts, required: true }));
  }

  return applyDecorators(...decorators);
}
