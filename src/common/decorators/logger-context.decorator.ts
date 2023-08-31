import { isAsyncFunction } from 'util/types';

interface IOptions {
  label?: string;
  logError?: boolean;
}

/**
 * It takes a function and returns a function that logs the arguments and return value of the original
 * function
 * @param [options] - This is an optional parameter that allows you to pass in a custom logger.
 * @returns A function that takes 3 parameters.
 */
export function LoggerContext(options?: Partial<IOptions>) {
  return (
    target: Record<string, any>,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<(...params: any[]) => any>,
    // eslint-disable-next-line sonarjs/cognitive-complexity
  ) => {
    const className = target.constructor.name;
    const original = descriptor.value;
    const isAsync = isAsyncFunction(descriptor.value);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    descriptor.value = new Proxy(original, {
      apply: function (thisTarget: any, thisArg, args) {
        const name = propertyKey || descriptor.value?.name || 'anonymous';
        const originalContext = thisArg.logger?.context;
        // Get the new context
        const newContext = className ? `${className}:${name}` : `${originalContext}:${name}`;
        // Set the context
        if (thisArg.logger && thisArg.logger.context !== newContext) {
          thisArg.logger.context = newContext;
        }

        try {
          const res = thisTarget?.apply(thisArg, args);

          if (!isAsync) {
            // If it's not an async function, then we can just return the result
            return res;
          }

          return res
            .catch((error) => {
              if (options?.logError) {
                thisArg.logger?.error(error.message, error.stack, newContext);
              }
              throw error;
            })
            .finally(() => {
              // Unset the context
              if (thisArg.logger && thisArg.logger.context !== originalContext) {
                thisArg.logger.context = originalContext;
              }
            });
        } catch (error) {
          if (options?.logError) {
            thisArg.logger?.error(error.message, error.stack, newContext);
          }
          throw error;
        } finally {
          // Unset the context
          if (!isAsync && thisArg.logger && thisArg.logger.context !== originalContext) {
            thisArg.logger.context = originalContext;
          }
        }
      },
    });
  };
}
