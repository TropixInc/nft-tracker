import { AppConfig } from 'config/app.config';
import { Controller, Get, Post, PreconditionFailedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MigrationService } from './migration.service';

@ApiTags('Util')
@ApiBearerAuth()
@Controller('migrations')
export class MigrationController {
  constructor(
    private readonly migrationService: MigrationService,
    private configService: ConfigService<AppConfig, true>,
  ) {}

  @Post('run')
  async runMigrations() {
    return await this.migrationService.runMigrations();
  }

  @Post('revert')
  async revertMigrations() {
    if (this.configService.get('node_env') === 'production') {
      throw new PreconditionFailedException('Revert is not allowed in production');
    }

    return await this.migrationService.revertMigrations();
  }

  @Get('pending')
  async getPendingMigrations() {
    const migrations = await this.migrationService.getPendingMigrations();
    return {
      count: migrations.length,
      pending: migrations.length !== 0,
      migrations,
    };
  }

  @Get('list')
  async getAllMigrations() {
    return await this.migrationService.getAllMigrations();
  }
}
