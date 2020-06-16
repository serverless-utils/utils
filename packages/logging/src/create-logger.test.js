/* eslint-disable no-console */
import chalk from 'chalk';
import { defaultColorMap, LogLevel, consoleLog } from '@utilz/logger';
import { createLogger } from './create-logger';

class ServerlessError extends Error {}

const createServerless = (log) => ({
  cli: {
    log:
      log ||
      ((message) => {
        // eslint-disable-next-line no-console
        console.log(message);
      }),
  },
  classes: {
    Error: ServerlessError,
  },
});

describe('createLogger', () => {
  it('throws given no serverless', () => {
    expect(() => createLogger({ pluginName: 'foo' })).toThrow(
      'No serverless specified.'
    );
  });

  it('throws given non string plugin name', () => {
    expect(() =>
      createLogger({ pluginName: false, serverless: createServerless() })
    ).toThrow('pluginName expected to be a string.');
  });

  it('return expected logger object', () => {
    expect(
      createLogger({ pluginName: 'foo', serverless: createServerless() })
    ).toMatchObject({
      trace: expect.any(Function),
      debug: expect.any(Function),
      info: expect.any(Function),
      warn: expect.any(Function),
      error: expect.any(Function),
      throw: expect.any(Function),
    });
  });

  it('trace should not log message without SLS_DEBUG', () => {
    const logger = createLogger({
      pluginName: 'plugin',
      serverless: createServerless(),
    });

    console.log = jest.fn();
    logger.trace('message');
    expect(console.log).not.toHaveBeenCalled();
  });

  it('debug should not log message without SLS_DEBUG', () => {
    const logger = createLogger({
      pluginName: 'plugin',
      serverless: createServerless(),
    });

    console.log = jest.fn();
    logger.debug('message');
    expect(console.log).not.toHaveBeenCalled();
  });

  describe('SLS_DEBUG', () => {
    beforeEach(() => {
      process.env.SLS_DEBUG = '*';
    });

    afterEach(() => {
      process.env.SLS_DEBUG = undefined;
    });

    it('trace should log expected message with SLS_DEBUG', () => {
      const logger = createLogger({
        pluginName: 'plugin',
        serverless: createServerless(),
      });

      console.log = jest.fn();
      logger.trace('message');

      expect(console.log).toHaveBeenCalledWith(
        chalk.hex(defaultColorMap[LogLevel.TRACE])('plugin: TRACE: message')
      );
    });

    it('debug should log expected message with SLS_DEBUG', () => {
      const logger = createLogger({
        pluginName: 'plugin',
        serverless: createServerless(),
      });

      console.log = jest.fn();
      logger.debug('message');

      expect(console.log).toHaveBeenCalledWith(
        chalk.hex(defaultColorMap[LogLevel.DEBUG])('plugin: DEBUG: message')
      );
    });
  });

  it('info should log expected message', () => {
    const logger = createLogger({
      pluginName: 'plugin',
      serverless: createServerless(),
    });

    console.log = jest.fn();
    logger.info('message');
    expect(console.log).toHaveBeenCalledWith('plugin: INFO: message');
  });

  it('warn should log expected message', () => {
    const logger = createLogger({
      pluginName: 'plugin',
      serverless: createServerless(),
    });

    console.log = jest.fn();
    logger.warn('message');
    expect(console.log).toHaveBeenCalledWith(
      chalk.hex(defaultColorMap[LogLevel.WARN])('plugin: WARN: message')
    );
  });

  it('warn should log expected exception', () => {
    const logger = createLogger({
      pluginName: 'plugin',
      serverless: createServerless(),
    });

    console.log = jest.fn();
    logger.warn('message', new Error('exception'));
    expect(console.log).toHaveBeenCalledWith(
      chalk.hex(defaultColorMap[LogLevel.WARN])(
        'plugin: WARN: message Error: exception'
      )
    );
  });

  it('error should log expected message', () => {
    const logger = createLogger({
      pluginName: 'plugin',
      serverless: createServerless(),
    });

    console.log = jest.fn();
    logger.error('message');
    expect(console.log).toHaveBeenCalledWith(
      chalk.hex(defaultColorMap[LogLevel.ERROR])('plugin: ERROR: message')
    );
  });

  it('error should log expected exception', () => {
    const logger = createLogger({
      pluginName: 'plugin',
      serverless: createServerless(),
    });

    console.log = jest.fn();
    logger.error('message', new Error('exception'));
    expect(console.log).toHaveBeenCalledWith(
      chalk.hex(defaultColorMap[LogLevel.ERROR])(
        'plugin: ERROR: message Error: exception'
      )
    );
  });

  it('throw should throw expected message', () => {
    const logger = createLogger({
      pluginName: 'plugin',
      serverless: createServerless(),
    });

    expect(() => logger.throw('message')).toThrow('plugin: ERROR: message');
  });

  it('should allow format to be overridden', () => {
    const logger = createLogger({
      pluginName: 'plugin',
      serverless: createServerless(),
      format: ({ message }) => `overridden: plugin: ${message}`,
    });

    expect(() => logger.throw('message')).toThrow(
      'overridden: plugin: message'
    );
  });

  it('should allow log to be overridden', () => {
    const logger = createLogger({
      pluginName: 'plugin',
      serverless: createServerless(() => {}),
      log: ({ message }) =>
        // eslint-disable-next-line no-console
        console.log(`plugin: custom: ${message}`),
    });

    console.log = jest.fn();

    logger.info('message');

    expect(console.log).toHaveBeenCalledWith('plugin: custom: message');
  });

  it('should allow colors to be overridden', () => {
    const logger = createLogger({
      pluginName: 'plugin',
      serverless: createServerless(),
      log: consoleLog({
        // eslint-disable-next-line no-console
        log: (message) => console.log(message),
        colors: {
          [LogLevel.INFO]: '#c0c',
        },
      }),
    });

    console.log = jest.fn();

    logger.info('message');

    expect(console.log).toHaveBeenCalledWith(
      chalk.hex('#c0c')('INFO: message')
    );
  });

  it('should not log plugin name if not provided', () => {
    const logger = createLogger({
      serverless: createServerless(),
    });

    console.log = jest.fn();

    logger.info('message');

    expect(console.log).toHaveBeenCalledWith('INFO: message');
  });
});
