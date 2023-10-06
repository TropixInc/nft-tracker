import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bull';
import { ChainId } from 'common/enums';
import { subMinutes } from 'date-fns';
import { parallel } from 'radash';
import { Optional } from 'src/common/interfaces';
import { ILike, LessThan, Repository } from 'typeorm';
import { LocalQueueEnum, TokenJobJobs } from '../queue/enums';
import { TokenJobEntity } from './entities/tokens-jobs.entity';
import { TokenEntity } from './entities/tokens.entity';
import { TokenJobStatus, TokenJobType } from './enums';
import { TokenNotFoundException } from './exceptions';
import { TokensJobsFetchMetadataService } from './tokens-jobs-fetch-metadata.service';
import { TokensJobsUploadAssetService } from './tokens-jobs-upload-asset.service';
import { TokensJobsVerifyMintService } from './tokens-jobs-verify-mint.service';

@Injectable()
export class TokensJobsRefreshTokenService {
  logger = new Logger(TokensJobsRefreshTokenService.name);

  constructor(
    @InjectRepository(TokenJobEntity)
    private readonly tokenJobRepository: Repository<TokenJobEntity>,
    @InjectRepository(TokenEntity)
    private readonly tokenRepository: Repository<TokenEntity>,
    @InjectQueue(LocalQueueEnum.TokenJob)
    private readonly queue: Queue,
    private readonly verifyMintService: TokensJobsVerifyMintService,
    private readonly fetchMetadataService: TokensJobsFetchMetadataService,
    private readonly uploadAssetService: TokensJobsUploadAssetService,
  ) {}

  async execute(jobId: string): Promise<void> {
    const job = await this.tokenJobRepository.findOne({
      where: {
        id: jobId,
        type: TokenJobType.RefreshToken,
        status: TokenJobStatus.Created,
        executeAt: LessThan(new Date()),
      },
    });
    if (!job || !job?.tokensIds?.length) {
      return Promise.resolve();
    }
    this.logger.debug(`Executing refresh token from ${job.address!}/${job.chainId!}/${job.tokensIds[0]}`);
    try {
      await this.tokenJobRepository.update(job.id, {
        status: TokenJobStatus.Started,
        startedAt: new Date(),
      });
      await this.verifyMintService.verifyMintByTokensIds({
        tokensIds: job.tokensIds,
        chainId: job.chainId!,
        address: job.address!,
      });
      let token = await this.getToken({
        address: job.address!,
        chainId: job.chainId!,
        tokenId: job.tokensIds[0],
      });
      if (!token) {
        throw new TokenNotFoundException(job.address!, job.chainId!, job.tokensIds[0]);
      }
      await this.fetchMetadataService.fetchMetadataByTokenAndUpdate({
        address: job.address!,
        chainId: job.chainId!,
        tokenId: job.tokensIds[0],
        tokenUri: token?.tokenUri,
      });
      token = await this.getToken({
        address: job.address!,
        chainId: job.chainId!,
        tokenId: job.tokensIds[0],
      });
      if (!token?.imageRawUrl) {
        throw new Error('Token imageRawUrl is empty');
      }
      await this.uploadAssetService.uploadAssetAndUpdateToken({
        assetUri: token?.imageRawUrl,
      });
      await this.tokenJobRepository.update(job.id, {
        status: TokenJobStatus.Completed,
        completeAt: new Date(),
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
        type: TokenJobType.RefreshToken,
        startedAt: LessThan(subMinutes(new Date(), 5)),
      },
      {
        status: TokenJobStatus.Created,
        executeAt: new Date(),
        startedAt: null,
      },
    );
  }

  async scheduleNextJobs(): Promise<void> {
    const jobs = await this.tokenJobRepository.find({
      where: {
        status: TokenJobStatus.Created,
        type: TokenJobType.RefreshToken,
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
        TokenJobJobs.ExecuteRefreshTokenByJob,
        {
          jobId: job.id,
        },
        {
          jobId: `${TokenJobJobs.ExecuteRefreshTokenByJob}:${job.id}`,
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

  private async getToken(params: {
    address: string;
    chainId: ChainId;
    tokenId: string;
  }): Promise<Optional<TokenEntity>> {
    return await this.tokenRepository.findOne({
      where: {
        address: ILike(params.address),
        chainId: params.chainId,
        tokenId: params.tokenId,
      },
    });
  }
}
