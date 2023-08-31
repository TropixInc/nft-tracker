import { constantCaseTransformer } from 'database/database.helpers';
import { BaseEntity } from 'database/base.entity';
import { JsonPrimitive } from 'type-fest';
import { Column, Entity } from 'typeorm';
import { Configuration } from '../interfaces';

@Entity('configurations')
export class ConfigurationEntity extends BaseEntity implements Configuration {
  @Column({ type: 'text', name: 'key', nullable: false, unique: true, transformer: [constantCaseTransformer] })
  key: string;

  @Column({ type: 'json', nullable: true, name: 'value', default: null })
  value: JsonPrimitive | Record<string, any> | null = null;

  @Column({ type: 'json', nullable: false, name: 'schema', default: {} })
  schema: Record<string, any>;

  @Column({ type: 'boolean', nullable: false, name: 'active', default: true })
  active: boolean;
}
