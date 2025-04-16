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
  }

  getMessage(type, correlationId) {
    return correlationId ? `${type}-${correlationId}` : type;
  }

  async waitForMessage(type, correlationId) {
    const message = this.getMessage(type, correlationId);
    return new Promise((resolve) => {
      this.once(message, (payload) => {
        resolve(payload);
      });
    });
  }

  /**
   * @param {keyof typeof channelConfigs} configName
   * @param {string} type
   * @param {any} payload
   * @param {string} correlationId
   */
  sendMessage(configName, type, payload, correlationId) {
    const channel = getChannelSync(channelConfigs[configName]);
    const message = Buffer.from(JSON.stringify({ type, payload }));
    const { routingKey, exchangeName } = channelConfigs[configName];

    channel.publish(exchangeName, routingKey, message, {
      correlationId,
    });

    return this;
  }
}

const receiver = new Receiver();

module.exports = receiver;
