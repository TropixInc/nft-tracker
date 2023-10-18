import { Injectable } from '@nestjs/common';
import { HealthCheckError, HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { EvmService } from '../blockchain/evm/evm.service';
@Injectable()
export class BlockchainHealthIndicator extends HealthIndicator {
  constructor(private readonly ethereumService: EvmService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const { statusHttp } = await this.ethereumService.getBlockchainCheckedProviders();
    const isHealthy = statusHttp.ready;
    const result = this.getStatus(key, isHealthy, { statusHttp });

    if (isHealthy) {
      return result;
    }

    throw new HealthCheckError(`${BlockchainHealthIndicator.name}`, result);
  }
}
