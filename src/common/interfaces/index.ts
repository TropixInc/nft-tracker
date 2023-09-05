import { Request } from 'express';
import { FindOptionsRelations, QueryRunner } from 'typeorm';

export type ProcessHandlerFunction = (...args: any[]) => Promise<any>;
export type ProcessHandlerAggregator<Type extends string> = Record<
  `${Uncapitalize<Type>}Handler`,
  ProcessHandlerFunction
>;
export interface ApplicationWatcher {
  start: (...args: any[]) => Promise<void>;
  stop: (...args: any[]) => Promise<void>;
}

export type ApplicationWorker<T extends string> = ProcessHandlerAggregator<T>;

export interface PaginatedResult<T> {
  items: T[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export interface CustomRequest<T = any> extends Request {
  body: T;
  ips: string[];
}

export interface HttpExceptionResponse {
  timestamp: string;
  path: string;
  error: string;
  statusCode: number;
  message: string;
  data?: any;
}

export interface FunctionOptions {
  throwError?: boolean;
}

export interface DatabaseFunctionOptions<Relations = any> extends FunctionOptions {
  relations?: FindOptionsRelations<Relations>;
  queryRunnerArg?: QueryRunner;
}

export type Prettify<T> = {
  [P in keyof T]: T[P];
} & Record<string, any>;

export type Nullable<T> = T | null;

export type Optional<T> = T | null | undefined;
