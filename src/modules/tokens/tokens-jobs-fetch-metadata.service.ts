import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChainId } from 'common/enums';
import { runTransaction } from 'common/helpers/transaction.helper';
import { subMinutes } from 'date-fns';
import { isObject, isString } from 'lodash';
import { RequestHelpers } from 'src/common/helpers/request.helpers';
import { DatabaseFunctionOptions, Optional } from 'src/common/interfaces';
import { LessThan, Repository } from 'typeorm';
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
    private readonly tokensJobsService: TokensJobsService,
  ) {}

  async execute(): Promise<void> {
    const job = await this.getNextJob();
    this.logger.debug(`Starting job ${job?.id}`);
    if (!job || !job.tokensUris?.length) {
      return Promise.resolve();
    }
    try {
      this.logger.debug(`Starting job ${job.tokensUris[0]}`);
      await this.tokenJobRepository.update(job.id, {
        status: TokenJobStatus.Started,
        startedAt: new Date(),
      });
      const payload = await this.fetchMetadata(job.tokensUris[0]);
      await runTransaction<void>(this.tokenJobRepository.manager, async (queryRunner) => {
        await queryRunner.manager.update(TokenJobEntity, job.id, {
          status: TokenJobStatus.Completed,
          completeAt: new Date(),
        });
        await this.updateMetadataToken(
          {
            address: job.address,
            chainId: job.chainId,
            tokenId: job.tokensIds[0],
            payload,
          },
          { queryRunnerArg: queryRunner },
        );
      });
    } catch (error) {
      this.logger.error(error);
      await this.tokenJobRepository.update(job.id, {
        status: TokenJobStatus.Failed,
        failedAt: new Date(),
      });
      throw error;
    }
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
        this.logger.warn(`Job already exists for ${item.tokenUri}`);
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

  private async getNextJob(): Promise<Optional<TokenJobEntity>> {
    return this.tokenJobRepository.findOne({
      where: {
        status: TokenJobStatus.Created,
        type: TokenJobType.FetchMetadata,
      },
      order: {
        executeAt: 'ASC',
      },
    });
  }

  private fetchMetadata(tokenUri: string): Promise<Record<string, unknown>> {
    const axiosInstance = RequestHelpers.getInstance().getAxiosInstance();
    return axiosInstance
      .get(tokenUri)
      .then((response) => response.data)
      .catch((error) => {
        this.logger.error(`Error fetching metadata from ${tokenUri}`, error);
        return {};
      });
  }

  private updateMetadataToken(
    params: { address: string; chainId: ChainId; tokenId: string; payload: Record<string, unknown> },
    opts?: DatabaseFunctionOptions,
  ) {
    return runTransaction<void>(
      this.tokenJobRepository.manager,
      async (queryRunner) => {
        const sanitizePayload = this.sanitizePayload(params.payload);
        await queryRunner.manager.update(
          TokenEntity,
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
          },
        );
      },
      opts?.queryRunnerArg,
    );
  }

  private sanitizePayload(payload: Record<string, unknown>): {
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
      result.imageRawUrl = this.sanitizeUri(result.imageRawUrl);
    }

    return result;
  }

  sanitizeUri(uri: string): string {
    return uri.replace(/^ipfs:\/\/ipfs\//, 'https://ipfs.io/ipfs/');
  }
}
