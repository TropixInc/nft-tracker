import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LoggerContext } from '@tropixinc/pixchain-nestjs-helpers';
import Ajv from 'ajv';
import { createSchema } from 'genson-js';
import { Get, JsonPrimitive } from 'type-fest';
import { Repository } from 'typeorm';
import { CreateConfigurationDto } from './dto/create-configuration.dto';
import { UpdateConfigurationDto } from './dto/update-configuration.dto';
import { ConfigurationEntity } from './entities/configuration.entity';
import { Configuration } from './interfaces';
import { compile } from 'json-schema-to-typescript';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigKeys, ConfigStorage } from './interfaces/schema-generated';

import { pascalCase } from 'change-case';

const ajv = new Ajv();

@Injectable()
export class ConfigurationService implements OnModuleInit {
  logger = new Logger(ConfigurationService.name);
  store: Map<string, ConfigurationEntity> = new Map([]);
  loaded = false;

  constructor(
    @InjectRepository(ConfigurationEntity)
    private readonly repository: Repository<ConfigurationEntity>,
  ) {}

  async onModuleInit() {
    await this.load();
  }

  @LoggerContext()
  async load() {
    try {
      const configurations = await this.findAll();
      const tempStore: Map<string, ConfigurationEntity> = new Map([]);

      for (const conf of configurations) {
        if (!conf.active) continue;
        this.validate(conf.value, conf.schema);
        tempStore.set(conf.key, conf);
      }

      this.logger.log(`Configuration loaded: ${configurations.length} active keys`);

      // Only set the store if all configurations are loaded
      this.store = tempStore;

      this.loaded = true;
    } catch (e) {
      this.logger.error(`Configuration load error: ${e.message}`, e.stack);
      throw e;
    }
  }

  @LoggerContext({ logError: true })
  async get<T extends ConfigKeys = ConfigKeys>(key: T): Promise<Get<ConfigStorage, T> | undefined> {
    if (!this.loaded) await this.load();
    return this.store.get(key)?.value as Get<ConfigStorage, T>;
  }

  @LoggerContext({ logError: true })
  async create(dto: CreateConfigurationDto) {
    let configuration: ConfigurationEntity | null = await this.repository.findOne({
      where: {
        key: dto.key,
      },
    });

    if (configuration) throw new UnprocessableEntityException(`Configuration with key ${dto.key} already exists`);

    dto.schema = this.resolveSchema(dto);

    this.validate(dto.value, dto.schema);

    configuration = await this.repository.save(dto);

    this.logger.log(`Configuration created: ${configuration.key}`);

    // TODO wrap everything in a transaction
    await this.load();
    await this.generateTypes();
    await this.createMigration(configuration);

    return configuration;
  }

  async createMigration(entity: ConfigurationEntity) {
    const timestamp = Date.now();
    const name = pascalCase(entity.key) + 'Conf';
    const filePath = path.resolve('src', 'modules', 'database', 'migrations', `${timestamp}-${name}.ts`);

    const content = await this.getMigrationTemplate(entity, `${name}${timestamp}`);

    // Insert new migration
    fs.writeFileSync(filePath, content);
  }

  private validate(value: JsonPrimitive | Record<string, any> | null, schema: Record<string, any>) {
    if (typeof value === 'undefined') throw new UnprocessableEntityException('Value is undefined');

    const validate = ajv.compile(schema);
    const valid = validate(value);
    if (!valid) throw new UnprocessableEntityException(validate.errors?.map((e) => e.message).join(', '));
  }

  private resolveSchema(dto: Partial<Pick<Configuration, 'value' | 'schema'>>): Record<string, any> {
    if (!dto) throw new InternalServerErrorException('No schema found during schema resolution');

    const value = dto.value ?? null;
    const hasRules = Object.keys(dto.schema || {}).length > 0;
    return hasRules ? dto.schema! : createSchema(value);
  }

  async findAll(): Promise<ConfigurationEntity[]> {
    return this.repository.find();
  }

  async findAllActives(): Promise<ConfigurationEntity[]> {
    return this.repository.find({ where: { active: true } });
  }

  async findOne(id: string): Promise<ConfigurationEntity | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async findOneOrFail(id: string): Promise<ConfigurationEntity> {
    return await this.repository.findOneOrFail({ where: { id } });
  }

  @LoggerContext({ logError: true })
  async update(id: string, dto: UpdateConfigurationDto): Promise<ConfigurationEntity> {
    if (!dto) throw new UnprocessableEntityException(`DTO is empty during update`);
    const configuration = await this.repository.findOne({ where: { id } });
    if (!configuration) throw new UnprocessableEntityException(`Configuration with id ${id} not found`);

    const hasRules = Object.keys(dto.schema || {}).length > 0;
    dto.schema = hasRules ? dto.schema : configuration.schema;
    this.validate(dto.value!, dto.schema!);

    const result = await this.repository.update(id, dto);

    result.affected && this.logger.log(`Configuration updated: ${id}`);
    await this.load().catch((e) => this.logger.error(`Configuration load error: ${e.message}`));

    return await this.repository.findOneOrFail({ where: { id } });
  }

  @LoggerContext({ logError: true })
  async remove(id: string) {
    const result = await this.repository.delete(id);
    result.affected && this.logger.log(`Configuration deleted: ${id}`);
    return true;
  }

  async getMigrationTemplate(entity: ConfigurationEntity, name: string): Promise<string> {
    const [sql, params] = this.repository
      .createQueryBuilder()
      .insert()
      .into(ConfigurationEntity)
      .values(entity)
      .orIgnore()
      .printSql()
      .getQueryAndParameters();

    return `
    import { MigrationInterface, QueryRunner } from 'typeorm';

    export class ${name} implements MigrationInterface {
      name = '${name}';

      public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(\`${sql}\`, ${JSON.stringify(params)});
      }

      public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(\`DELETE from "configurations" WHERE id = '${entity.id}';\`);
      }
    }

    `;
  }

  async generateTypes() {
    // TODO Reorganize this
    const types: string[] = [];
    const names: string[] = [];

    for await (const conf of this.store.values()) {
      const ts = await compile(conf.schema, conf.key, { bannerComment: '// AUTO-GENERATED;' });
      types.push(ts);
      names.push(conf.key);
    }

    if (!types.length) throw new InternalServerErrorException('No types to generate');

    const filePath = path.resolve('src', 'modules', 'configuration', 'interfaces', 'schema-generated.ts');

    const exportSchemas = `export type ConfigSchema = ${names.join(' | ')}`;
    const exportKeys = `export type ConfigKeys = ${names.map((name) => "'" + name + "'").join(' | ')}`;
    const exportStorage = `export interface ConfigStorage {\n${names
      .map((name) => name + ':' + name + ';')
      .join('\n')} }\n`;

    const exportTypes = types.join('');

    const content = ['\n', exportTypes, exportSchemas, exportKeys, exportStorage].join('\n\n');

    fs.writeFileSync(filePath, content);
  }
}
