import EventEmitter from 'node:events';
import { v4 as uuidV4 } from 'uuid';

import { channelConfigs, getChannel, getChannelSync } from './channels.ts';
import { logger } from '../utils/logger.ts';

class Receiver extends EventEmitter {
  constructor() {
    super();
    this.channel = null;
    this.init().catch((error) => {
      logger.error('Receiver failed to initialize', {
        service: 'activities-service',
        error: error.message,
      });
    });
  }

  generateCorrelationId() {
    return uuidV4();
  }

  async init() {
    // the receiver is for this service. it listens for messages from other services
    this.channel = await getChannel(channelConfigs.activitiesService);
    logger.info('Receiver connected and listening for messages', { service: 'activities-service' });
    this.channel.consume(
      channelConfigs.activitiesService.queueName,
      (msg) => {
        if (msg !== null) {
          const content = JSON.parse(msg.content.toString());
          console.trace('Received message:', content);

          const type = content.type;
          const correlationId = msg.properties.correlationId;
          const message = correlationId ? `${type}-${correlationId}` : type;
          this.emit(message, content.payload);
          this.emitActivityIdEvents(type, content.payload, correlationId);
          this.channel.ack(msg);
        }
      },
      { noAck: false }
    );
  }

  emitActivityIdEvents(type, payload, correlationId) {
    const activityIds = this.extractActivityIds(payload);
    for (const activityId of activityIds) {
      this.emit('activityId', {
        type,
        activityId,
        correlationId,
        payload,
      });
    }
  }

  extractActivityIds(payload) {
    if (payload === null || payload === undefined) {
      return [];
    }

    if (typeof payload === 'number' || typeof payload === 'string') {
      return [payload];
    }

    if (Array.isArray(payload)) {
      return payload.flatMap((item) => this.extractActivityIds(item));
    }

    if (typeof payload === 'object' && payload.activityId !== undefined && payload.activityId !== null) {
      return [payload.activityId];
    }

    return [];
  }

  onActivityId(handler) {
    this.on('activityId', handler);
    return this;
  }

  /**
   * The event emitted by this receiver upon receiving a message from the queue
   * @param {string} type
   * @param {string} [correlationId]
   * @returns the payload of the message from the queue
   */
  async waitForMessage(type, correlationId) {
    const message = correlationId ? `${type}-${correlationId}` : type;
    logger.info(
      `Waiting for message \`${type}\` with correlationId \`${correlationId}\``,
      { service: 'activities-service' }
    );
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
   * @param {string} [correlationId]
   * @returns {Receiver}
   */
  sendMessage(configName, type, payload, correlationId) {
    logger.info(
      `Sending message to \`${configName}\` with type \`${type}\``,
      { service: 'activities-service' }
    );
    const channel = getChannelSync(channelConfigs[configName]);
    const message = Buffer.from(JSON.stringify({ type, payload }));
    const { routingKey, exchangeName } = channelConfigs[configName];

    channel.publish(exchangeName, routingKey, message, {
      correlationId,
    });

    return this;
  }

  /**
   * @param {keyof typeof channelConfigs} configName
   * @param {string} type
   * @param {any} payload
   * @param {string} [responseType]
   * @returns {any} the payload of the message from the queue
   */
  sendAndAwaitMessage(configName, type, payload, responseType = `${type}-response`) {
    const correlationId = this.generateCorrelationId();
    this.sendMessage(configName, type, payload, correlationId);
    return this.waitForMessage(responseType, correlationId);
  }

  /**
   * @param {keyof typeof channelConfigs} configName
   * @param {string} type
   * @param {any} payload
   * @param {string[]} responseTypes
   * @returns {Promise<any>[]}
   */
  sendAndAwaitCorrelatedMessages(configName, type, payload, responseTypes) {
    const correlationId = this.generateCorrelationId();
    this.sendMessage(configName, type, payload, correlationId);

    return this.waitForCorrelatedMessages(responseTypes, correlationId);
  }

  waitForCorrelatedMessages(types, correlationId) {
    const promises = types.map((type) => this.waitForMessage(type, correlationId));
    return promises;
  }
}

const receiver = new Receiver();

export default receiver;
