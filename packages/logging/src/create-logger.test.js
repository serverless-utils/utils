import { createLogger } from './create-logger';

class ServerlessError extends Error {
  constructor(message) {
    super(message);
  }
}

const createServerless = () => ({
  cli: {
    log: (message) => {
      console.log(message);
    },
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

  it('throws given no plugin name', () => {
    expect(() => createLogger()).toThrow('No pluginName specified.');
  });

  it('throws given empty plugin name', () => {
    expect(() =>
      createLogger({ pluginName: '', serverless: createServerless() })
    ).toThrow('No pluginName specified.');
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

    expect(global.console.log).toHaveBeenCalledWith('plugin: DEBUG: message');
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
    expect(global.console.log).toHaveBeenCalledWith('plugin: WARN: message');
  });

  it('warn should log expected exception', () => {
    const logger = createLogger({
      pluginName: 'plugin',
      serverless: createServerless(),
    });

    global.console.log = jest.fn();
    logger.warn('message', new Error('exception'));
    expect(global.console.log).toHaveBeenCalledWith(
      'plugin: WARN: message Error: exception'
    );
  });

  it('error should log expected message', () => {
    const logger = createLogger({
      pluginName: 'plugin',
      serverless: createServerless(),
    });

    global.console.log = jest.fn();
    logger.error('message');
    expect(global.console.log).toHaveBeenCalledWith('plugin: ERROR: message');
  });

  it('error should log expected exception', () => {
    const logger = createLogger({
      pluginName: 'plugin',
      serverless: createServerless(),
    });

    global.console.log = jest.fn();
    logger.error('message', new Error('exception'));
    expect(global.console.log).toHaveBeenCalledWith(
      'plugin: ERROR: message Error: exception'
    );
  });

  it('throw should throw expected message', () => {
    const logger = createLogger({
      pluginName: 'plugin',
      serverless: createServerless(),
    });

    expect(() => logger.throw('message')).toThrow('plugin: ERROR: message');
  });
});
