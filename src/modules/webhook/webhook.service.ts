import { HttpStatus, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios, { AxiosError } from 'axios';
import { isURL } from 'class-validator';
import { SetOptional } from 'type-fest';
import { Repository } from 'typeorm';
import { v4 as UUIDv4 } from 'uuid';
import { WebhookAttemptEntity } from './entities/webhook-attempt.entity';
import { WebhookRequest, WebhookResponse } from './interfaces';

@Injectable()
export class WebhookService {
  logger = new Logger(WebhookService.name);

  constructor(
    @InjectRepository(WebhookAttemptEntity)
    private webhookAttemptRepository: Repository<WebhookAttemptEntity>,
  ) {}

  /**
   * It sends a webhook request, logs the attempt, and returns the webhook request
   * @param data - The data to send to the webhook.
   * @returns The webhook request
   */
  async send(data: SetOptional<WebhookRequest, 'id' | 'method'>): Promise<WebhookAttemptEntity> {
    this.logger.verbose(`Sending webhook: ${JSON.stringify(data)}`);
    if (!isURL(data.url, { require_tld: false })) {
      throw new Error(`Invalid URL: ${data.url}`);
    }

    const webhook: WebhookRequest = {
      ...data,
      id: data.id || UUIDv4(),
      method: data.method || 'post',
      timeout: data.timeout || 30000,
      retry: data.retry ?? true,
    };

    try {
      // Send request
      const response = await axios[webhook.method](webhook.url, webhook.body, {
        headers: webhook.headers,
        timeout: webhook.timeout,
      });

      this.logger.verbose(`Webhook ${webhook.id} sent successfully`);

      // Persist result
      return await this.logAttempt(webhook, {
        code: response.status,
        data: response.data,
      });
    } catch (error) {
      // If error is AxiosError, extract response and persist the attempt
      if ((error as AxiosError).isAxiosError) {
        const axiosError = error as AxiosError;
        const response: WebhookResponse = {
          code: axiosError.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
          data: axiosError.response?.data,
        };

        await this.logAttempt(webhook, response);
      } else {
        this.logger.error(error);
      }
      throw error;
    }
  }

  /**
   * It saves a webhook attempt to the database
   * @param webhook - WebhookRequest<T>
   * @param {WebhookResponse} response - WebhookResponse
   */
  async logAttempt(webhook: WebhookRequest, response: WebhookResponse): Promise<WebhookAttemptEntity> {
    await this.webhookAttemptRepository.save({
      ...webhook,
      ...response,
    });
    return this.webhookAttemptRepository.findOneOrFail({ where: { id: webhook.id } });
  }

  async retry(id: string): Promise<void> {
    const webhook = await this.webhookAttemptRepository.findOne({ where: { id } });
    if (!webhook) {
      throw new InternalServerErrorException(`Webhook ${id} not found`);
    }
    if (webhook.code >= 400) {
      await this.send({
        ...webhook,
      });
    }
  }

  getAttemptsFailedAfterOneMinute() {
    return this.webhookAttemptRepository
      .createQueryBuilder()
      .where("code >= 400 AND updated_at < NOW() - INTERVAL '1 minute' AND retry = true");
  }
}
