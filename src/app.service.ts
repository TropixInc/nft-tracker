import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from './config/app.config';
@Injectable()
export class AppService {
  constructor(private configService: ConfigService<AppConfig, true>) {}

  getIndex() {
    return {
      name: this.configService.get('name'),
      version: this.configService.get('version'),
    };
  }

  getInfo() {
    return {
      name: this.configService.get('name'),
      version: this.configService.get('version'),
      node_env: this.configService.get('node_env'),
      app_env: this.configService.get('app_env'),
      // supported_chain_ids: this.configService.get('supported_chain_ids'),
    };
  }
}
