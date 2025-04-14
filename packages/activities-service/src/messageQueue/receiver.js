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
          const correlationId = msg.properties.correlationId;
          this.emit(`${content.type}-${correlationId}`, content.payload);
          this.channel.ack(msg);
        }
      },
      { noAck: false }
    );
  }

  async waitForMessage(type, correlationId) {
    return new Promise((resolve) => {
      this.once(`${type}-${correlationId}`, (payload) => {
        resolve(payload);
      });
    });
  }

  /**
   * @param {keyof typeof channelConfigs} configName
   * @param {string} type
   * @param {any} payload
   */
  sendMessage(configName, type, payload, correlationId) {
    const ingestionChannel = getChannelSync(channelConfigs[configName]);
    const message = Buffer.from(JSON.stringify({ type, payload }));
    const { routingKey, exchangeName } = channelConfigs[configName];

    ingestionChannel.publish(exchangeName, routingKey, message, {
      correlationId,
    });

    return this;
  }
}

const receiver = new Receiver();

module.exports = receiver;
