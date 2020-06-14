import chalk from 'chalk';
import { isNil, isString, isFunction } from '@utilz/types';
import { deepmerge } from '@utilz/deepmerge';
import { LogLevel, createLogger as createLoggerBase } from './logger';
import { isObject } from 'util';

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
    !serverless.classes.Error instanceof Error
  ) {
    throw new Error('No Error property on the serverless classes property.');
  }
};

export const defaultFormat = ({
  pluginName,
  level,
  message,
  params,
  error,
}) => {
  const msg =
    params && params.length > 0 ? util.format(message, params) : message;

  const errorMessage = error ? ` ${error.toString()}` : '';

  return pluginName
    ? `${pluginName}: ${level}: ${msg}${errorMessage}`
    : `${level}: ${msg}${errorMessage}`;
};

export const defaultColorMap = {
  [LogLevel.DEBUG]: '#636363',
  [LogLevel.WARN]: '#fff200',
  [LogLevel.ERROR]: '#ff2414',
};

export const defaultLog = (options = {}) => ({
  pluginName,
  serverless,
  level,
  message,
  params,
  error,
}) => {
  const defaultOptions = {
    format: defaultFormat,
    colors: defaultColorMap,
  };

  const { format, colors } = deepmerge(defaultOptions, options);

  ensureValidPluginName(pluginName);
  ensureValidServerless(serverless);

  if (isNil(format) || !isFunction(format)) {
    throw new Error('No format function provided.');
  }

  if (isNil(colors) || !isObject(colors)) {
    throw new Error('No colors map provided.');
  }

  if (level === LogLevel.DEBUG && !process.env.SLS_DEBUG) {
    return;
  }

  const msg = format({ pluginName, level, message, params, error });

  if (colors.hasOwnProperty(level)) {
    serverless.cli.log(chalk.hex(colors[level])(msg));
    return;
  }

  serverless.cli.log(msg);
};

export const createLogger = (options = {}) => {
  const defaultOptions = {
    pluginName: undefined,
    serverless: undefined,
    format: defaultFormat,
    log: defaultLog(),
  };

  const { pluginName, serverless, format, log } = Object.assign(
    {},
    defaultOptions,
    options
  );

  ensureValidPluginName(pluginName);
  ensureValidServerless(serverless);

  const baseLogger = createLoggerBase({
    level: LogLevel.DEBUG,
    log: ({ level, message, params, error }) =>
      log({ pluginName, serverless, level, message, params, error }),
  });

  return {
    ...baseLogger,
    throw: (message, params) => {
      throw new serverless.classes.Error(
        format({ pluginName, level: LogLevel.ERROR, message, params })
      );
    },
  };
};
