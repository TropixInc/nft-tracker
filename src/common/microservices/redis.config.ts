import { ConfigService } from '@nestjs/config';
import { AppConfig } from 'config/app.config';
import { RedisOptions, Transport } from '@nestjs/microservices';
import { parseRedisURL } from 'common/helpers/connection.helper';

export function getConfig(configService: ConfigService<AppConfig, true>) {
  const redisUrl = configService.get('queue_url');
  const redisConfig = parseRedisURL(redisUrl);
  const options: RedisOptions = {
    transport: Transport.REDIS,
    options: {
      host: redisConfig.socket.host,
      port: redisConfig.socket.port,
      db: redisConfig.database,
      tls: redisConfig.socket.tls,
      retryAttempts: 20,
      retryDelay: 3000,
      connectTimeout: 5000,
      keepAlive: 1,
      password: redisConfig?.password || undefined,
    },
  };
  return options;
}
