import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { Queue } from 'bull';
import * as crypto from 'crypto';
import { subMinutes } from 'date-fns';
import { isString } from 'lodash';
import { parallel } from 'radash';
import { AppConfig, CloudinaryConfig } from 'src/config/app.config';
import { ILike, LessThan, Repository } from 'typeorm';
import { LocalQueueEnum, TokenJobJobs } from '../queue/enums';
import { TokenAssetEntity } from './entities/tokens-assets.entity';
import { TokenJobEntity } from './entities/tokens-jobs.entity';
import { TokenEntity } from './entities/tokens.entity';
import { TokenAssetStatus, TokenJobStatus, TokenJobType } from './enums';
import { TokensJobsService } from './tokens-jobs.service';

@Injectable()
export class TokensJobsUploadAssetService {
  logger = new Logger(TokensJobsUploadAssetService.name);

  private readonly cloudinaryConfig: CloudinaryConfig;

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
    protected readonly configService: ConfigService<AppConfig>,
  ) {
    this.cloudinaryConfig = this.configService.get('cloudinary')!;
  }

  async execute(jobId: string): Promise<void> {
    const job = await this.tokenJobRepository.findOne({
      where: {
        id: jobId,
        type: TokenJobType.UploadAsset,
        status: TokenJobStatus.Created,
        executeAt: LessThan(new Date()),
      },
    });
    if (!job || !isString(job.assetUri)) {
      return Promise.resolve();
    }
    try {
      await this.tokenJobRepository.update(job.id, {
        status: TokenJobStatus.Started,
        startedAt: new Date(),
      });
      this.logger.debug(`Executing upload asset by ${job.assetUri}`);
      const asset = await this.uploadAsset(job.assetUri);
      await this.updateAssetToken({
        publicId: asset.publicId,
        rawUri: job.assetUri,
        url: asset.url,
      });
      await this.tokenJobRepository.manager.update(TokenJobEntity, job.id, {
        status: TokenJobStatus.Completed,
        completeAt: new Date(),
      });
      this.logger.verbose(`Job ${job.assetUri} completed`);
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
        type: TokenJobType.UploadAsset,
        startedAt: LessThan(subMinutes(new Date(), 5)),
      },
      {
        status: TokenJobStatus.Created,
        executeAt: new Date(),
        startedAt: null,
      },
    );
  }

  async checkTokensWithoutMediaCache(): Promise<void> {
    const items = await this.tokenRepository.query(`SELECT tokens.image_raw_url 
              FROM tokens
               LEFT OUTER JOIN tokens_jobs
                               on tokens.image_raw_url::text ILIKE tokens_jobs.asset_uri AND
                                  tokens_jobs.type = 'upload_asset'
                    WHERE tokens_jobs.id IS NULL
                      AND (tokens.image_raw_url IS NOT NULL OR tokens.image_raw_url <> '')
              GROUP BY tokens.image_raw_url
              LIMIT 10`);
    for await (const item of items) {
      if (!item) continue;
      await this.tokensJobsService.createJob({
        tokensIds: [],
        tokensUris: [],
        assetUri: item.image_raw_url,
        address: null,
        chainId: null,
        type: TokenJobType.UploadAsset,
        executeAt: new Date(),
      });
    }
  }

  async scheduleNextJobs(): Promise<void> {
    const jobs = await this.tokenJobRepository.find({
      where: {
        status: TokenJobStatus.Created,
        type: TokenJobType.UploadAsset,
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
        TokenJobJobs.ExecuteUploadAssetByJob,
        {
          jobId: job.id,
        },
        {
          jobId: `${TokenJobJobs.ExecuteUploadAssetByJob}:${job.id}`,
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

  private async uploadAsset(fileUrl: string): Promise<{ publicId: string; url: string }> {
    const publicId = this.createHashFromURI(fileUrl);
    const timestamp = Math.floor(new Date().getTime() / 1000);

    const queryString = `faces=true&overwrite=true&public_id=${publicId}&timestamp=${timestamp}&upload_preset=${this.cloudinaryConfig.uploadPreset}`;
    const signature = this.generateSignature(queryString);

    const urlRegex =
      /^(https?:\/\/(?:www\.)?.+\.(?:mp4|avi|mkv|mov|wmv|flv|webm|3gp|mpg|mpeg|ogg|ogv|vob|qt|divx|rm|rmvb|asf|m4v|swf|f4v|mpg|mpeg|ts|m2ts|mts|dat|vob))$/i;

    const apiUrl = `${this.cloudinaryConfig.endpointUrl}/${this.cloudinaryConfig.cloudName}/${
      urlRegex.test(fileUrl) ? 'video' : 'image'
    }/upload`;

    try {
      const cloudinaryResponse = await axios
        .post(apiUrl, null, {
          params: {
            file: fileUrl,
            api_key: this.cloudinaryConfig.apiKey,
            signature,
            ...Object.fromEntries(queryString.split('&').map((param) => param.split('='))),
          },
        })
        .then((response) => response.data);
      return {
        publicId: cloudinaryResponse.public_id,
        url: cloudinaryResponse.secure_url,
      };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  private async updateAssetToken(params: { rawUri: string; publicId: string; url: string }) {
    await this.assetRepository.upsert(
      {
        rawUrl: params.rawUri,
        publicId: params.publicId,
        url: params.url,
        status: TokenAssetStatus.Uploaded,
      },
      ['publicId'],
    );
    const asset = await this.assetRepository.findOne({
      where: {
        publicId: params.publicId,
      },
    });
    await this.tokenRepository.update(
      {
        imageRawUrl: ILike(params.rawUri),
      },
      {
        assetId: asset?.id,
      },
    );
  }

  private createHashFromURI(uri: string): string {
    const hash = crypto.createHash('sha256');
    hash.update(uri);
    return hash.digest('hex');
  }
  private generateSignature(params: string): string {
    const hash = crypto.createHash('sha256');
    return hash.update(`${params}${this.cloudinaryConfig.apiSecret}`, 'utf-8').digest('hex');
  }
}
