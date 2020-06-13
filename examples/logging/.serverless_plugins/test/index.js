const { createLogger } = require('@serverless-utils/logging');

class TestPlugin {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;
    this.logger = createLogger({ pluginName: 'test', serverless });

    this.hooks = {
      'before:package:finalize': this.test.bind(this),
    };
  }

  test() {
    this.logger.debug(`This is a debug message.`);
    this.logger.info(`This is an info message.`);
    this.logger.warn(`This is a warning message.`);
    this.logger.warn(
      `This is a warning message with exception.`,
      new Error('warning')
    );
    this.logger.error(`This is an error message.`);
    this.logger.error(
      `This is an error message with exception.`,
      new Error('error')
    );

    this.logger.throw(new Error('This is a thrown error.'));
  }
}

module.exports = TestPlugin;
