import { Module } from '@nestjs/common';
import { MigrationService } from './migration.service';
import { MigrationController } from './migration.controller';
import { MigrationHealthIndicator } from './migration.health';
@Module({
  controllers: [MigrationController],
  providers: [MigrationService, MigrationHealthIndicator],
  exports: [MigrationHealthIndicator],
})
export class DatabaseModule {}
