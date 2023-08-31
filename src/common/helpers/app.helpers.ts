import { INestApplication } from '@nestjs/common';
import { Logger } from 'nestjs-pino';

interface Options {
  coreDump: boolean;
  timeout: number;
}

/**
 * It's a function that returns a function that returns a function that returns a function
 * @param {INestApplication} app - The application instance.
 * @param {Options} options - Options
 * @returns The `gracefulShutdownFn` function returns a function that can be used to gracefully
 * shut down the application.
 */
export function gracefulShutdownFn(
  app: INestApplication,
  logger: Logger,
  options: Options = { coreDump: false, timeout: 10_000 },
) {
  // Exit function
  const exit = (code: number) => {
    logger.log(`Exiting down with code ${code}`);
    options.coreDump ? process.abort() : process.exit(code);
  };

  let shutdownTimer: NodeJS.Timeout | undefined;

  return (code: number, reason?: string) =>
    (err?: Error): void => {
      logger.log(`Application termination called with code ${code}: ${reason}.`);
      if (err && err instanceof Error) {
        logger.error(err.message, err.stack);
      }

      // If timer is set, an exit is already scheduled, so do nothing
      if (shutdownTimer) {
        return;
      }

      // We need to use promise here  instead of async/await because the return don't handle async functions.
      // eslint-disable-next-line promise/catch-or-return,promise/no-promise-in-callback
      app
        .close()
        // eslint-disable-next-line promise/always-return
        .then(() => {
          logger.log('Application closed successfully.');
          exit(code);
        })
        .catch((err: Error) => {
          logger.error(`Application close failed. ${err.message}: ${err.stack}`);
          shutdownTimer = undefined;
          exit(1);
        })
        .finally(() => {
          logger.verbose('pegadinha do malandro');
          if (shutdownTimer) {
            clearTimeout(shutdownTimer);
          }
        });

      shutdownTimer = setTimeout(() => {
        logger.warn(`Application did not close gracefully in ${options.timeout}ms.`);
        exit(1);
      }, options.timeout);
    };
}
