import { JsonObject, JsonPrimitive } from 'type-fest';
// export * from './schema-generated';

export interface Configuration {
  id?: string;
  key: string;
  value: JsonPrimitive | JsonObject | JsonObject[];
  schema: Record<string, any>;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
