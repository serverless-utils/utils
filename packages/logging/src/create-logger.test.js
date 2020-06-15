import chalk from 'chalk';
import { createLogger } from './create-logger';
import { defaultColorMap, defaultLog } from './create-console-logger';
import { LogLevel } from './log-level';

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
      debug: expect.any(Function),
      info: expect.any(Function),
      warn: expect.any(Function),
      error: expect.any(Function),
      throw: expect.any(Function),
    });
  });

  it('debug should not log message with no SLS_DEBUG', () => {
    const logger = createLogger({
      pluginName: 'plugin',
      serverless: createServerless(),
    });

    global.console.log = jest.fn();
    logger.debug('message');
    expect(global.console.log).not.toHaveBeenCalledWith(
      'plugin: DEBUG: message'
    );
  });

  it('debug should log expected message with SLS_DEBUG', () => {
    const logger = createLogger({
      pluginName: 'plugin',
      serverless: createServerless(),
    });

    process.env.SLS_DEBUG = '*';

    global.console.log = jest.fn();
    logger.debug('message');

    expect(global.console.log).toHaveBeenCalledWith(
      chalk.hex(defaultColorMap[LogLevel.DEBUG])('plugin: DEBUG: message')
    );
  });

  it('info should log expected message', () => {
    const logger = createLogger({
      pluginName: 'plugin',
      serverless: createServerless(),
    });

    global.console.log = jest.fn();
    logger.info('message');
    expect(global.console.log).toHaveBeenCalledWith('plugin: INFO: message');
  });

  it('warn should log expected message', () => {
    const logger = createLogger({
      pluginName: 'plugin',
      serverless: createServerless(),
    });

    global.console.log = jest.fn();
    logger.warn('message');
    expect(global.console.log).toHaveBeenCalledWith(
      chalk.hex(defaultColorMap[LogLevel.WARN])('plugin: WARN: message')
    );
  });

  it('warn should log expected exception', () => {
    const logger = createLogger({
      pluginName: 'plugin',
      serverless: createServerless(),
    });

    global.console.log = jest.fn();
    logger.warn('message', new Error('exception'));
    expect(global.console.log).toHaveBeenCalledWith(
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

    global.console.log = jest.fn();
    logger.error('message');
    expect(global.console.log).toHaveBeenCalledWith(
      chalk.hex(defaultColorMap[LogLevel.ERROR])('plugin: ERROR: message')
    );
  });

  it('error should log expected exception', () => {
    const logger = createLogger({
      pluginName: 'plugin',
      serverless: createServerless(),
    });

    global.console.log = jest.fn();
    logger.error('message', new Error('exception'));
    expect(global.console.log).toHaveBeenCalledWith(
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

    global.console.log = jest.fn();

    logger.info('message');

    expect(global.console.log).toHaveBeenCalledWith('plugin: custom: message');
  });

  it('should allow colors to be overridden', () => {
    const logger = createLogger({
      pluginName: 'plugin',
      serverless: createServerless(),
      log: defaultLog({
        // eslint-disable-next-line no-console
        log: (message) => console.log(message),
        colors: {
          [LogLevel.INFO]: '#c0c',
        },
      }),
    });

    global.console.log = jest.fn();

    logger.info('message');

    expect(global.console.log).toHaveBeenCalledWith(
      chalk.hex('#c0c')('INFO: message')
    );
  });

  it('should not log plugin name if not provided', () => {
    const logger = createLogger({
      serverless: createServerless(),
    });

    global.console.log = jest.fn();

    logger.info('message');

    expect(global.console.log).toHaveBeenCalledWith('INFO: message');
  });
});
