const EventEmitter = require('node:events');

const { channelConfigs, getChannel, getChannelSync } = require('./channels');

class Receiver extends EventEmitter {
  constructor() {
    super();
    this.channel = null;
    this.init();
  }

  async init() {
    this.channel = await getChannel(channelConfigs.activitiesService);
    this.channel.consume(
      channelConfigs.activitiesService.queueName,
      (msg) => {
        if (msg !== null) {
          const content = JSON.parse(msg.content.toString());
          this.emit(content.type, content.payload);
          this.channel.ack(msg);
        }
      },
      { noAck: false }
    );
  }

  async waitForMessage(type) {
    return new Promise((resolve) => {
      this.once(type, (payload) => {
        resolve(payload);
      });
    });
  }

  /**
   * @param {keyof typeof channelConfigs} configName
   * @param {string} type
   * @param {any} payload
   */
  sendMessage(configName, type, payload) {
    const ingestionChannel = getChannelSync(channelConfigs[configName]);
    const message = Buffer.from(JSON.stringify({ type, payload }));
    const { routingKey, exchangeName } = channelConfigs[configName];

    ingestionChannel.publish(exchangeName, routingKey, message);

    return this;
  }
}

const receiver = new Receiver();

module.exports = receiver;
