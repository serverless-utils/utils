import { isNil, isString, isFunction } from '@utilz/types';

import {
  createLogger as createLoggerBase,
  consoleLog,
  consoleFormat,
  LogLevel,
} from '@utilz/logger';

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

  const format =
    options.format ||
    consoleFormat({
      applicationName: options.pluginName,
      timestamp: options.timestamp,
    });

  const defaultLog = (props) => {
    const logDisabled =
      (props.level === LogLevel.TRACE || props.level === LogLevel.DEBUG) &&
      !process.env.SLS_DEBUG;

    return consoleLog({
      write: (message) => {
        if (logDisabled) {
          return;
        }

        options.serverless.cli.log(message);
      },
      format,
    })(props);
  };

  return {
    ...createLoggerBase({
      level: LogLevel.TRACE,
      log: options.log || defaultLog,
    }),
    throw: (message, error) => {
      throw new options.serverless.classes.Error(
        format({ level: LogLevel.ERROR, message, error })
      );
    },
  };
};
