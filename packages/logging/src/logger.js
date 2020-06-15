import { deepmerge } from '@utilz/deepmerge';
import { defaultLog } from './default-log';
import { LogLevel } from './log-level';

const logLevels = {
  [LogLevel.DEBUG]: 20,
  [LogLevel.INFO]: 30,
  [LogLevel.WARN]: 40,
  [LogLevel.ERROR]: 50,
};

const ensureValidLogLevel = (levelName) => {
  if (!logLevels[levelName]) {
    throw new Error(
      `Invalid log level '${levelName}', expected one of ${Object.keys(
        logLevels
      ).join(', ')}`
    );
  }
};

export const createLogger = (opts) => {
  const defaultLevel = LogLevel.INFO;

  const defaultOptions = {
    level: defaultLevel,
    context: {},
    log: defaultLog,
  };

  const options = deepmerge(defaultOptions, opts);
  let currentLevelName = options.level;

  ensureValidLogLevel(currentLevelName);

  const enabled = (levelName) => {
    const level = logLevels[levelName];
    if (!level) {
      return false;
    }

    return level >= (logLevels[currentLevelName] || defaultLevel);
  };

  const log = (levelName, message, params, error) => {
    ensureValidLogLevel(levelName);

    if (!enabled(levelName)) {
      return;
    }

    const paramsIsError = !error && params instanceof Error;

    options.log({
      level: levelName,
      message,
      params: paramsIsError ? undefined : params,
      error: paramsIsError ? params : error,
      context: options.context,
    });
  };

  return {
    log,
    debug: (message, params) => log(LogLevel.DEBUG, message, params),
    info: (message, params) => log(LogLevel.INFO, message, params),
    warn: (message, params, error) =>
      log(LogLevel.WARN, message, params, error),
    error: (message, params, error) =>
      log(LogLevel.ERROR, message, params, error),
    setLevel: (levelName) => {
      ensureValidLogLevel(levelName);
      currentLevelName = levelName;
    },
    getLevel: () => currentLevelName,
  };
};
