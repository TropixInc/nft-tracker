import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job, Queue } from 'bull';
import { ChainId } from 'src/common/enums';
import { ApplicationWorker } from 'src/common/interfaces';
import { EvmEventsJobs, LocalQueueEnum } from 'src/modules/queue/enums';
import { EvmEventsService } from '../evm-events.services';
import { EvmService } from '../evm.service';
import { EventSyncBlock } from '../interfaces';

@Processor(LocalQueueEnum.EvmEvents)
export class EvmEventsProcessor implements ApplicationWorker<'syncBlock'> {
  readonly logger = new Logger(EvmEventsProcessor.name);
  private chainIds: ChainId[] = [];

  constructor(
    private readonly eventsService: EvmEventsService,
    @InjectQueue(LocalQueueEnum.EvmEvents) private eventsQueue: Queue,
    private readonly evmService: EvmService,
  ) {}

  @Process({ name: EvmEventsJobs.SyncBlock, concurrency: 3 })
  async syncBlockHandler(job: Job<EventSyncBlock>) {
    if (this.evmService.supportChainId(job.data.chainId)) {
      this.logger.verbose(`[${job.data.chainId}] Receive block ${job.data.blockNumber} of chain`);
      await this.eventsService.getLogsByChainIdAndBlockNumber(job.data.chainId, job.data.blockNumber);
      await this.eventsService.saveLastBlockNumberSync(job.data.chainId, job.data.blockNumber);
      this.logger.verbose(`[${job.data.chainId}] Saving lasted block sync ${job.data.blockNumber}`);
    } else {
      this.logger.verbose(`Chain ${job.data.chainId} disabled`);
    }
  }
}
