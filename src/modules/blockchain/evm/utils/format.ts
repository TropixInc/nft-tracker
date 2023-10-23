import { isHexString } from 'ethers';
import { isBigNumberish, BigNumber } from '@ethersproject/bignumber/lib/bignumber';

export class Format {
  static from(value: any) {
    if (value === null || value === undefined) {
      return value;
    } else if (typeof value === 'number') {
      return value;
    } else if (Format.isBoolean(value)) {
      if (typeof value === 'boolean') return value;
      else if (value === 'true') return true;
      else if (value === 'false') return false;
    } else if (isHexString(value)) {
      return value.toLowerCase();
    } else if (typeof value === 'string') {
      return value;
    } else if (Array.isArray(value)) {
      return Format.fromArray(value);
    } else if (typeof value === 'object' && !Format.isBigNumber(value)) {
      return Format.fromObject(value);
    } else if (Format.isBigNumber(value)) {
      return BigNumber.from(value);
    } else {
      return value;
    }
  }

  static fromObject(value: any) {
    const newValue: any = {};
    for (const key of Object.keys(value)) {
      newValue[key] = Format.from(value[key]);
    }
    return newValue;
  }

  static fromArray(data: any): any {
    return data.map(Format.from);
  }

  static isBigNumber(data: any): boolean {
    try {
      return isBigNumberish(BigNumber.from(data));
    } catch (error) {
      return false;
    }
  }

  static isBoolean(value: any) {
    return typeof value === 'boolean' || value === 'true' || value === 'false';
  }
}
