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
      db: redisConfig.database?.toString(),
      tls: redisConfig.socket.tls,
      url: redisUrl,
      retryAttempts: 20,
      retryDelay: 3000,
      connect_timeout: 5000,
      socket_keepalive: true,
      password: redisConfig?.password || undefined,
    },
  };
  return options;
}
