const amqp = require('amqplib');

/** @type {import('amqplib').Connection | null} */
let connection = null;

/** @type {import('amqplib').Channel} */
let channel = null;

const boundChannels = new Map();

/**
 * Get a channel from the connection.
 * If the connection is not established, it will create a new connection.
 * If the channel is not created, it will create a new channel.
 * If the channel is already created, it will return the existing channel.
 * @throws {Error} If the connection or channel cannot be created.
 */
const getChannel = async ({ makeNew } = {}) => {
  if (!makeNew && channel) return channel;
  if (!connection) connection = await amqp.connect('amqp://guest:guest@rabbitmq:5672');

  if (makeNew) return connection.createChannel();
  channel = await connection.createChannel();
  return channel;
};

/**
 * Get a channel for a bounded queue.
 * If the channel is already created, it will return the existing channel.
 * If the channel is not created, it will create a new channel.
 * @param {string} exchangeName - The name of the exchange.
 * @param {string} boundedQueueName - The name of the bounded queue.
 * @param {"direct" | "topic" | "headers" | "fanout" | "match"} type
 * @returns {Promise<import('amqplib').Channel>} - The channel for the bounded queue.
*/
const getBoundedChannel = async (exchangeName, boundedQueueName = '', type = 'fanout') => {
  const key = `${exchangeName}-${boundedQueueName}`;
  if (boundChannels.has(key)) return boundChannels.get(key);

  const channel = await getChannel({ makeNew: true });
  await channel.assertExchange(exchangeName, type, { durable: false });
  const q = await channel.assertQueue(boundedQueueName, { exclusive: true });
  await channel.bindQueue(q.queue, exchangeName, '');

  boundChannels.set(key, channel);
  return channel;
}

/**
 * @description Close the connection and channel.
 * @returns {Promise<void>}
 * @throws {Error} If the connection or channel cannot be closed.
 */
const closeConnection = async () => {
  if (channel) await channel.close();
  if (connection) await connection.close();
};

process.on('SIGINT', closeConnection);
process.on('SIGTERM', closeConnection);

module.exports = {
  getChannel,
  getBoundedChannel,
  closeConnection,
};