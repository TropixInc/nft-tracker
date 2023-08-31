import { ValueTransformer } from 'typeorm';

export const lowercase: ValueTransformer = {
  to: transformToLowercase,
  from: transformToLowercase,
};

export const uppercase: ValueTransformer = {
  to: transformToUppercase,
  from: transformToUppercase,
};

import { constantCase } from 'change-case';

export const constantCaseTransformer: ValueTransformer = {
  to: transformToConstantCase,
  from: transformToConstantCase,
};

export function transformToConstantCase(databaseValue: any) {
  if (Array.isArray(databaseValue)) {
    return databaseValue.map((value: any) => {
      if (typeof value == 'string') {
        return constantCase(value ?? '');
      }
      return databaseValue;
    });
  } else if (typeof databaseValue == 'string') {
    return constantCase(databaseValue ?? '');
  }
  return databaseValue;
}

export function transformToLowercase(databaseValue: any) {
  if (Array.isArray(databaseValue)) {
    return databaseValue.map((value: any) => {
      if (typeof value == 'string') {
        return value?.toLowerCase() ?? '';
      }
      return databaseValue;
    });
  } else if (typeof databaseValue == 'string') {
    return databaseValue?.toLowerCase() ?? '';
  }
  return databaseValue;
}

export function transformToUppercase(databaseValue: any) {
  if (Array.isArray(databaseValue)) {
    return databaseValue.map((value: any) => (typeof value === 'string' ? value?.toUpperCase() ?? '' : databaseValue));
  } else if (typeof databaseValue === 'string') {
    return databaseValue?.toUpperCase() ?? '';
  }
  return databaseValue;
}
