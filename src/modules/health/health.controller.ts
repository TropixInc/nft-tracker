/* eslint-disable sonarjs/no-identical-functions */
import { Controller, Get, Logger, Res, ServiceUnavailableException, Response } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
  HealthIndicatorFunction,
  HealthIndicatorResult,
  HttpHealthIndicator,
  MemoryHealthIndicator,
  MicroserviceHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { InjectMetric, PrometheusController } from '@willsoto/nestjs-prometheus';
import { Gauge } from 'prom-client';
import { IsPublic } from 'common/decorators/ispublic.decorator';
import { QueueHealthIndicator } from 'modules/queue/queue.health';
import { AppConfig } from 'config/app.config';
import { MigrationHealthIndicator } from 'database/migration.health';
import { Cron, CronExpression } from '@nestjs/schedule';
import v8 from 'node:v8';
import { LocalQueueEnum } from 'modules/queue/enums';
import { BlockchainHealthIndicator } from './blockchain.health';

const LOCAL_WEBHOOK_KEY = `${LocalQueueEnum.Webhook}_queue` as const;
const LOCAL_TOKEN_JOB_KEY = `${LocalQueueEnum.TokenJob}_queue` as const;
const LOCAL_EVM_EVENTS_KEY = `${LocalQueueEnum.EvmEvents}_queue` as const;

interface Indicators {
  migration: () => Promise<HealthIndicatorResult>;
  database: () => Promise<HealthIndicatorResult>;
  memory_heap: () => Promise<HealthIndicatorResult>;
  memory_rss_aloc: () => Promise<HealthIndicatorResult>;
  blockchain: () => Promise<HealthIndicatorResult>;
  [LOCAL_WEBHOOK_KEY]: () => Promise<HealthIndicatorResult>;
  [LOCAL_TOKEN_JOB_KEY]: () => Promise<HealthIndicatorResult>;
  [LOCAL_EVM_EVENTS_KEY]: () => Promise<HealthIndicatorResult>;
}

function getMaxMemory(): number {
  // Extract --max-old-space-size if exists
  const maxOldSpaceSizeValue =
    process.env.NODE_OPTIONS?.split(' ')
      .find((x) => x.trim().startsWith('--max-old-space-size='))
      ?.split('=')[1]
      ?.trim() ?? '';

  const maxOldSpaceSize = Number.parseInt(maxOldSpaceSizeValue || '0', 10);
  const maxAvailableMemory = v8.getHeapStatistics().total_available_size;

  const maxMemory =
    maxOldSpaceSize > 0 ? Math.min(maxOldSpaceSize * 1024 * 1024, maxAvailableMemory) : maxAvailableMemory;
  if (maxMemory) {
    return Number(maxMemory);
  }
  return 256 * 1024 * 1024;
}

const MAX_MEMORY_HEAP = getMaxMemory();
const MAX_MEMORY_ALOC = MAX_MEMORY_HEAP * 0.9; // 90% of max memory

@ApiTags('Health')
@Controller('health')
export class HealthController extends PrometheusController {
  logger = new Logger(HealthController.name);

  constructor(
    private http: HttpHealthIndicator,
    private configService: ConfigService<AppConfig, true>,
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private memoryHealthIndicator: MemoryHealthIndicator,
    private microservice: MicroserviceHealthIndicator,
    private migration: MigrationHealthIndicator,
    private queueHealthIndicator: QueueHealthIndicator,
    private blockchainHealthIndicator: BlockchainHealthIndicator,
    @InjectMetric('app_health_checks') private readonly appHealthChecksGauges: Gauge<string>,
  ) {
    super();
  }

  @IsPublic()
  @Get()
  @HealthCheck()
  async check() {
    return await this.health.check(this.allIndicators());
  }

  @IsPublic()
  @Get('liveness')
  async getLiveness() {
    const check = await this.wrapCheckIndicators(this.livenessIndicators());

    if (check.status === 'error') {
      this.logger.error(this.getFirstError(check));
      throw new ServiceUnavailableException(`Service is not healthy due status ${check.status}`);
    }
  }

  @IsPublic()
  @Get('readiness')
  async getReadiness() {
    const check = await this.wrapCheckIndicators(this.readinessIndicators());

    if (check.status !== 'ok') {
      throw new ServiceUnavailableException(`Service is not healthy: ${this.getFirstError(check)}`);
    }
  }

  @IsPublic()
  @Get('metrics')
  async index(@Res({ passthrough: true }) response: Response) {
    return super.index(response);
  }

  private indicators(): Indicators {
    return {
      migration: () => this.migration.isHealthy(),
      database: () => this.db.pingCheck('database', { timeout: 5000 }),
      memory_heap: () => this.memoryHealthIndicator.checkHeap('memory_heap', MAX_MEMORY_HEAP),
      memory_rss_aloc: () => this.memoryHealthIndicator.checkRSS('memory_rss_aloc', MAX_MEMORY_ALOC),
      blockchain: () => this.blockchainHealthIndicator.isHealthy('blockchain'),
      [LOCAL_WEBHOOK_KEY]: () => this.queueHealthIndicator.isHealthy(LocalQueueEnum.Webhook),
      [LOCAL_TOKEN_JOB_KEY]: () => this.queueHealthIndicator.isHealthy(LocalQueueEnum.TokenJob),
      [LOCAL_EVM_EVENTS_KEY]: () => this.queueHealthIndicator.isHealthy(LocalQueueEnum.EvmEvents),
    };
  }

  allIndicators(): (() => Promise<HealthIndicatorResult>)[] {
    return Object.values(this.indicators());
  }

  livenessIndicators(): (() => Promise<HealthIndicatorResult>)[] {
    const indicators = this.indicators();
    return [
      indicators.database,
      indicators.blockchain,
      indicators[LOCAL_TOKEN_JOB_KEY],
      indicators[LOCAL_EVM_EVENTS_KEY],
    ];
  }

  readinessIndicators(): (() => Promise<HealthIndicatorResult>)[] {
    const indicators = this.indicators();

    return [indicators.migration, indicators.database, indicators.memory_heap, indicators.memory_rss_aloc];
  }

  private getFirstError(result: HealthCheckResult): string {
    const [first] = Object.entries(result.error || {});
    if (!first) {
      return 'Unknown error';
    }
    const [keys, value] = first;
    return `${keys} is ${value.status}: ${value.message}`;
  }

  private async wrapCheckIndicators(indicators: HealthIndicatorFunction[]): Promise<HealthCheckResult> {
    return this.health.check(indicators).catch((error) => {
      this.logger.error(error.message, error.stack);
      if (error.response?.status) {
        return error.response;
      }
      throw new ServiceUnavailableException(`Service is not healthy`);
    });
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async collectHealthCheckMetrics() {
    try {
      const check: HealthCheckResult = await this.wrapCheckIndicators(this.allIndicators());

      Object.entries(check.details).forEach(([key, value]) => {
        const val = value.status === 'up' ? 1 : 0;
        this.appHealthChecksGauges.set({ type: key }, val);
      });
    } catch (error) {
      this.logger.error(`Failed to update metrics: ${error.message}`, error.stack);
    }
  }
}
