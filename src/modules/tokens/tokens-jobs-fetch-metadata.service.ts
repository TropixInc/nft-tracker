import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bull';
import { isJSON, isURL } from 'class-validator';
import { ChainId } from 'common/enums';
import { subMinutes } from 'date-fns';
import { isObject, isString } from 'lodash';
import { parallel } from 'radash';
import { RequestHelpers } from 'src/common/helpers/request.helpers';
import { Optional } from 'src/common/interfaces';
import { ILike, LessThan, Repository } from 'typeorm';
import { sanitizeUri } from '../blockchain/evm/utils';
import { LocalQueueEnum, TokenJobJobs } from '../queue/enums';
import { TokenAssetEntity } from './entities/tokens-assets.entity';
import { TokenJobEntity } from './entities/tokens-jobs.entity';
import { TokenEntity } from './entities/tokens.entity';
import { TokenJobStatus, TokenJobType } from './enums';
import { TokensJobsService } from './tokens-jobs.service';

@Injectable()
export class TokensJobsFetchMetadataService {
  logger = new Logger(TokensJobsFetchMetadataService.name);

  constructor(
    @InjectRepository(TokenJobEntity)
    private readonly tokenJobRepository: Repository<TokenJobEntity>,
    @InjectRepository(TokenEntity)
    private readonly tokenRepository: Repository<TokenEntity>,
    @InjectRepository(TokenAssetEntity)
    private readonly assetRepository: Repository<TokenAssetEntity>,
    private readonly tokensJobsService: TokensJobsService,
    @InjectQueue(LocalQueueEnum.TokenJob)
    private readonly queue: Queue,
  ) {}

  async execute(jobId: string): Promise<void> {
    const job = await this.tokenJobRepository.findOne({
      where: {
        id: jobId,
        type: TokenJobType.FetchMetadata,
        status: TokenJobStatus.Created,
        executeAt: LessThan(new Date()),
      },
    });
    if (!job || !job.tokensUris?.length) {
      return Promise.resolve();
    }
    this.logger.debug(`Executing job fetch metadata ${job.id}`);
    try {
      await this.tokenJobRepository.update(job.id, {
        status: TokenJobStatus.Started,
        startedAt: new Date(),
      });
      await this.fetchMetadataByTokenAndUpdate({
        tokenId: job.tokensIds[0],
        address: job.address!,
        chainId: job.chainId!,
        tokenUri: job.tokensUris[0],
      });
      await this.tokenJobRepository.manager.update(TokenJobEntity, job.id, {
        status: TokenJobStatus.Completed,
        completeAt: new Date(),
      });
      this.logger.verbose(`Job ${job.tokensUris[0]} completed`);
    } catch (error) {
      this.logger.error(error);
      await this.tokenJobRepository.update(job.id, {
        status: TokenJobStatus.Failed,
        failedAt: new Date(),
      });
      throw error;
    }
  }

  async fetchMetadataByTokenAndUpdate(params: {
    tokenUri: string;
    address: string;
    chainId: ChainId;
    tokenId: string;
  }): Promise<void> {
    const payload = await this.fetchMetadata(params.tokenUri);
    await this.updateMetadataToken({
      address: params.address,
      chainId: params.chainId,
      tokenId: params.tokenId,
      payload,
    });
  }

  async checkJobsHaveAlreadyStartedButNotFinished(): Promise<void> {
    await this.tokenJobRepository.update(
      {
        status: TokenJobStatus.Started,
        type: TokenJobType.FetchMetadata,
        startedAt: LessThan(subMinutes(new Date(), 5)),
      },
      {
        status: TokenJobStatus.Created,
        executeAt: new Date(),
        startedAt: null,
      },
    );
  }

  async checkTokensWithoutMetadataForLongTime(): Promise<void> {
    const items = await this.tokenRepository
      .createQueryBuilder()
      .where("metadata = '{}' AND created_at < NOW() - INTERVAL '1 hour'")
      .limit(10)
      .orderBy('RANDOM()')
      .getMany();
    for await (const item of items) {
      if (!item) continue;
      const alreadyAlreadyExists = await this.tokenJobRepository
        .createQueryBuilder()
        .where(':tokenId = ANY(tokens_ids)', { tokenId: item.tokenId })
        .andWhere({ type: TokenJobType.FetchMetadata })
        .andWhere({ status: TokenJobStatus.Created })
        .getCount();

      if (alreadyAlreadyExists) {
        this.logger.verbose(`Job already exists for ${item.tokenUri}`);
        continue;
      }

      await this.tokensJobsService.createJob({
        tokensIds: [item.tokenId],
        tokensUris: [item.tokenUri],
        address: item.address,
        chainId: item.chainId,
        type: TokenJobType.FetchMetadata,
        executeAt: new Date(),
      });
    }
  }

  async scheduleNextJobs(): Promise<void> {
    const jobs = await this.tokenJobRepository.find({
      where: {
        status: TokenJobStatus.Created,
        type: TokenJobType.FetchMetadata,
        executeAt: LessThan(new Date()),
      },
      order: {
        executeAt: 'ASC',
      },
      take: 30,
      select: {
        id: true,
      },
    });
    await parallel(10, jobs, async (job) => {
      await this.queue.add(
        TokenJobJobs.ExecuteFetchMetadataByJob,
        {
          jobId: job.id,
        },
        {
          jobId: `${TokenJobJobs.ExecuteFetchMetadataByJob}:${job.id}`,
          attempts: 3,
          removeOnComplete: {
            age: 2 * 60,
            count: 1000,
          },
          removeOnFail: true,
        },
      );
    });
  }

  private fetchMetadata(tokenUri: string): Promise<Record<string, unknown>> | null {
    const uri = sanitizeUri(tokenUri);
    if (isURL(uri)) {
      const axiosInstance = RequestHelpers.getInstance().getAxiosInstance();
      return axiosInstance
        .get(uri)
        .then((response) => response.data)
        .catch((error) => {
          this.logger.error(`Error fetching metadata from ${uri}`, error);
          throw error;
        });
    } else if (isJSON(tokenUri)) {
      return this.tryJson(tokenUri);
    }
    return null;
  }

  private async updateMetadataToken(params: {
    address: string;
    chainId: ChainId;
    tokenId: string;
    payload?: Optional<Record<string, unknown>>;
  }) {
    const sanitizePayload = this.sanitizePayload(params.payload);
    const asset = sanitizePayload.imageRawUrl
      ? await this.assetRepository.findOne({
          where: {
            rawUrl: ILike(sanitizePayload.imageRawUrl),
          },
        })
      : null;
    await this.tokenRepository.update(
      {
        address: params.address,
        chainId: params.chainId,
        tokenId: params.tokenId,
      },
      {
        name: sanitizePayload?.name,
        description: sanitizePayload?.description,
        externalUrl: sanitizePayload?.externalUrl,
        imageRawUrl: sanitizePayload?.imageRawUrl,
        metadata: sanitizePayload?.metadata as any,
        assetId: asset?.id,
      },
    );
  }

  private sanitizePayload(payload: Optional<Record<string, unknown>>): {
    name?: Optional<string>;
    description?: Optional<string>;
    externalUrl?: Optional<string>;
    imageRawUrl?: Optional<string>;
    metadata: Record<string, unknown> | null;
  } {
    const result = {
      name: '',
      description: '',
      externalUrl: '',
      imageRawUrl: '',
      metadata: {},
    };
    const isPayloadValid = isObject(payload) && Object.keys(payload).length > 0;

    if (!isPayloadValid) {
      return result;
    }

    result.metadata = payload;

    if (isString(payload['name'])) {
      result.name = payload['name'] as string;
    }
    if (isString(payload['description'])) {
      result.description = payload['description'] as string;
    }
    if (isString(payload['external_url'])) {
      result.externalUrl = payload['external_url'] as string;
    } else if (isString(payload['externalUrl'])) {
      result.externalUrl = payload['externalUrl'] as string;
    }

    if (isString(payload['image'])) {
      result.imageRawUrl = payload['image'] as string;
    } else if (isString(payload['image_url'])) {
      result.imageRawUrl = payload['image_url'] as string;
    } else if (isString(payload['imageUrl'])) {
      result.imageRawUrl = payload['imageUrl'] as string;
    } else if (isString(payload['animation_url'])) {
      result.imageRawUrl = payload['animation_url'] as string;
    } else if (isString(payload['animationUrl'])) {
      result.imageRawUrl = payload['animationUrl'] as string;
    }

    if (result.imageRawUrl) {
      result.imageRawUrl = sanitizeUri(result.imageRawUrl);
    }

    return result;
  }

  tryJson(json: string) {
    try {
      return JSON.parse(json);
    } catch {
      return null;
    }
  }
}
