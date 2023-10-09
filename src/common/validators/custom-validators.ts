import { AddressZero } from '@ethersproject/constants';
import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint()
export class AddressCannotZero implements ValidatorConstraintInterface {
  validate(value: string) {
    return value.toLowerCase() !== AddressZero?.toLowerCase();
  }
}
