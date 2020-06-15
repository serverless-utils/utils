import { isNil, isString, isFunction } from '@utilz/types';
import {
  createConsoleLogger,
  defaultFormat,
  defaultLog,
} from './create-console-logger';

const ensureValidPluginName = (pluginName) => {
  if (isNil(pluginName)) {
    return;
  }

  if (!isString(pluginName)) {
    throw new Error('pluginName expected to be a string.');
  }
};

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
    !(serverless.classes.Error.prototype instanceof Error)
  ) {
    throw new Error('No Error property on the serverless classes property.');
  }
};

export const createLogger = (options = {}) => {
  ensureValidPluginName(options.pluginName);
  ensureValidServerless(options.serverless);

  const defaultOptions = {
    format: defaultFormat({ applicationName: options.pluginName }),
    log: defaultLog({
      log: (message) => options.serverless.cli.log(message),
      format: defaultFormat({ applicationName: options.pluginName }),
    }),
  };

  const { format, log } = {
    ...defaultOptions,
    ...options,
  };

  return createConsoleLogger({
    log,
    format,
    errorType: options.serverless.classes.Error,
  });
};
