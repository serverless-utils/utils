import chalk from 'chalk';
import { isNil, isString, isFunction } from '@utilz/types';
import { LogLevel, createLogger as createLoggerBase } from './logger';

const ensureValidServerless = (serverless) => {
  if (isNil(serverless)) {
    throw new Error('No serverless specified.');
  }

  if (isNil(serverless.cli)) {
    throw new Error('No cli property on serverless.');
  }

  if (isNil(serverless.cli.log) || !isFunction(serverless.cli.log)) {
    throw new Error('No log function on serverless cli property.');
  }

  if (isNil(serverless.classes)) {
    throw new Error('No classes property on serverless.');
  }

  if (
    isNil(serverless.classes.Error) ||
    !serverless.classes.Error instanceof Error
  ) {
    throw new Error('No Error property on the serverless classes property.');
  }
};

export const createLogger = (options = {}) => {
  const defaultOptions = {
    pluginName: undefined,
    serverless: undefined,
  };

  const { pluginName, serverless } = Object.assign({}, defaultOptions, options);

  if (isNil(pluginName)) {
    throw new Error('No pluginName specified.');
  }

  if (!isString(pluginName)) {
    throw new Error('pluginName expected to be string.');
  }

  if (pluginName === '') {
    throw new Error('No pluginName specified.');
  }

  ensureValidServerless(serverless);

  const format = (level, message, params, error) => {
    const msg =
      params && params.length > 0 ? util.format(message, params) : message;

    const errorMessage = error ? ` ${error.toString()}` : '';
    return `${pluginName}: ${level}: ${msg}${errorMessage}`;
  };

  const baseLogger = createLoggerBase({
    level: LogLevel.DEBUG,
    log: ({ level, message, params, error }) => {
      if (level === LogLevel.DEBUG && !process.env.SLS_DEBUG) {
        return;
      }

      const msg = format(level, message, params, error);

      switch (level) {
        case LogLevel.DEBUG:
          serverless.cli.log(chalk.hex('#636363')(msg));
          break;
        case LogLevel.WARN:
          serverless.cli.log(chalk.hex('#fff200')(msg));
          break;
        case LogLevel.ERROR:
          serverless.cli.log(chalk.red(msg));
          break;
        default:
          serverless.cli.log(msg);
          break;
      }
    },
  });

  return {
    ...baseLogger,
    throw: (message, params) => {
      throw new serverless.classes.Error(
        format(LogLevel.ERROR, message, params)
      );
    },
  };
};
