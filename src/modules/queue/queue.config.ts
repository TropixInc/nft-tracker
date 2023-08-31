import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppConfig } from 'config/app.config';
import { QueueConfigEnum } from './enums';
import { parseRedisURL } from 'common/helpers/connection.helper';

export const LocalConfig = BullModule.forRootAsync(QueueConfigEnum.LOCAL, {
  imports: [ConfigModule],
  useFactory: (configService: ConfigService<AppConfig, true>) => {
    const redisConfig = parseRedisURL(configService.get('queue_url'));
    return {
      redis: {
        host: redisConfig.socket.host,
        port: redisConfig.socket.port,
        db: redisConfig.database,
        tls: redisConfig.socket.tls,
      },
      prefix: `nft-tracker-queue:`,
    };
  },
  inject: [ConfigService],
});
