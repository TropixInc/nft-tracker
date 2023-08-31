import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Connection, createConnection, MigrationExecutor } from 'typeorm';
import { config as TypeOrmConfig } from '../../ormconfig';

@Injectable()
export class MigrationService implements OnModuleInit {
  logger = new Logger(MigrationService.name);
  typeormConnection: Connection;
  migrator: MigrationExecutor;

  async onModuleInit() {
    this.typeormConnection = await createConnection({
      ...TypeOrmConfig,
      name: 'migrations',
    });
    this.migrator = new MigrationExecutor(this.typeormConnection, this.typeormConnection.createQueryRunner());

    this.logger.log(`Migration connection: ${this.typeormConnection.isConnected ? 'Connected' : 'Disconnected'}`);
  }

  async runMigrations() {
    this.logger.log(`Start running migrations...`);
    const result = await this.migrator.executePendingMigrations();
    this.logger.log(`Migrations ran successfully...`);
    return result;
  }

  async revertMigrations() {
    this.logger.log(`Start reverting migrations...`);
    const result = await this.migrator.undoLastMigration();
    this.logger.log(`Migrations reverted successfully...`);
    return result;
  }

  async getPendingMigrations() {
    return await this.migrator.getPendingMigrations();
  }

  async getHasPendingMigrations() {
    return (await this.migrator.getPendingMigrations()).length !== 0;
  }

  async showMigrations() {
    return await this.migrator.showMigrations();
  }

  async getAllMigrations() {
    return await this.migrator.getAllMigrations();
  }
}
