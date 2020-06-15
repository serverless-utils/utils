import chalk from 'chalk';
import util from 'util';
import { deepmerge } from '@utilz/deepmerge';
import { isNil, isFunction, isObject } from '@utilz/types';
import { createLogger as createLoggerBase } from './logger';
import { LogLevel } from './log-level';

export const defaultColorMap = {
  [LogLevel.DEBUG]: '#636363',
  [LogLevel.WARN]: '#fff200',
  [LogLevel.ERROR]: '#ff2414',
};

export const defaultFormat = (options = {}) => ({
  level,
  message,
  params,
  error,
}) => {
  const { applicationName } = options;

  const msg =
    params && params.length > 0 ? util.format(message, params) : message;

  const errorMessage = error ? ` ${error.toString()}` : '';

  return applicationName
    ? `${applicationName}: ${level}: ${msg}${errorMessage}`
    : `${level}: ${msg}${errorMessage}`;
};

export const defaultLog = (options = {}) => ({
  level,
  message,
  params,
  error,
}) => {
  const defaultOptions = {
    log: () => {},
    format: defaultFormat(),
    colors: defaultColorMap,
  };

  const { log, format, colors } = deepmerge(defaultOptions, options);

  if (isNil(log) || !isFunction(log)) {
    throw new Error('No log function provided.');
  }

  if (isNil(format) || !isFunction(format)) {
    throw new Error('No format function provided.');
  }

  if (isNil(colors) || !isObject(colors)) {
    throw new Error('No colors map provided.');
  }

  if (level === LogLevel.DEBUG && !process.env.SLS_DEBUG) {
    return;
  }

  const msg = format({ level, message, params, error });

  if (Object.prototype.hasOwnProperty.call(colors, level)) {
    log(chalk.hex(colors[level])(msg));
    return;
  }

  log(msg);
};

export const createConsoleLogger = (options = {}) => {
  const defaultOptions = {
    // eslint-disable-next-line no-console
    log: (message) => console.log(message),
    errorType: Error,
    format: defaultFormat(options.applicationName),
  };

  const { log, errorType, format } = deepmerge(defaultOptions, options);

  const baseLogger = createLoggerBase({
    level: LogLevel.DEBUG,
    log,
  });

  return {
    ...baseLogger,
    throw: (message, params) => {
      // eslint-disable-next-line new-cap
      throw new errorType(format({ level: LogLevel.ERROR, message, params }));
    },
  };
};
