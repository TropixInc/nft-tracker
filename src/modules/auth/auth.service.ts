import { Injectable } from '@nestjs/common';
import { ConfigurationService } from '../configuration/configuration.service';

@Injectable()
export class AuthService {
  constructor(private readonly configurationService: ConfigurationService) {}
  async validateApiKey(apiKey: string): Promise<boolean> {
    const apiKeys = await this.configurationService.get('API_KEYS');
    return apiKeys?.some(({ value }) => value === apiKey) ?? false;
  }
}
