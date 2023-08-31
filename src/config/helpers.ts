import { Split } from 'type-fest';
import { LogLevel } from 'common/enums';

export const splitLog = (value: string): Split<LogLevel, ','> =>
  (value ?? '')
    .split(',')
    .map((level) => level.trim())
    .map<LogLevel>((level: string) => (level === 'log' ? 'info' : level) as any) as Split<LogLevel, ','>;

export const splitClear = <T = any>(value: string): T[] =>
  (value ?? '')?.split(',').map<T>((level: any) => level.trim());
