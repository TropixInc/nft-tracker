import { Injectable } from '@nestjs/common';
import { HealthCheckError, HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { EthereumService } from '../blockchain/evm/ethereum.service';
@Injectable()
export class BlockchainHealthIndicator extends HealthIndicator {
  constructor(private readonly ethereumService: EthereumService) {
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
