import { Injectable } from '@nestjs/common';
import { HealthCheckError, HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { MigrationService } from './migration.service';

@Injectable()
export class MigrationHealthIndicator extends HealthIndicator {
  constructor(private readonly migrationService: MigrationService) {
    super();
  }

  async isHealthy(): Promise<HealthIndicatorResult> {
    const pending = await this.migrationService.getPendingMigrations();
    const isHealthy = pending.length === 0;
    const result = this.getStatus('migrations', isHealthy, {
      pending: pending,
    });

    if (isHealthy) {
      return result;
    }

    throw new HealthCheckError(`${MigrationHealthIndicator.name}`, result);
  }
}
