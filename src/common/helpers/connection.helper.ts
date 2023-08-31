import { ClientOpts } from '@nestjs/microservices/external/redis.interface';
import * as net from 'net';
import { URL } from 'url';

export type RedisNetSocketOptions = Partial<net.SocketConnectOpts>;

export interface RedisClientOptions {
  url?: string;
  socket?: RedisNetSocketOptions;
  username?: string;
  password?: string;
  name?: string;
  database?: number;
  commandsQueueMaxLength?: number;
  readonly?: boolean;
}

/**
 * Parse a redis URL and return a RedisClientOptions object
 * @param {string} url - The URL of the Redis server.
 * @returns A `RedisClientOptions` object.
 */
export function parseRedisURL(url: string) {
  // https://www.iana.org/assignments/uri-schemes/prov/redis
  const { hostname, port, protocol, username, password, pathname } = new URL(url);

  const parsed: RedisClientOptions & { socket: ClientOpts } = {
    socket: {
      host: hostname,
    },
  };

  if (protocol === 'rediss:') {
    (parsed.socket as ClientOpts).tls = true;
  } else if (protocol !== 'redis:') {
    throw new TypeError('Invalid protocol');
  }

  if (port) {
    (parsed.socket as ClientOpts).port = Number(port);
  }

  if (username) {
    parsed.username = decodeURIComponent(username);
  }

  if (password) {
    parsed.password = decodeURIComponent(password);
  }

  if (pathname.length > 1) {
    const database = Number(pathname.substring(1));
    if (isNaN(database)) {
      throw new TypeError('Invalid pathname');
    }

    parsed.database = database;
  }

  return parsed;
}
