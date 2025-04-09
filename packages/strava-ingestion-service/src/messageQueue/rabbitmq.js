const amqp = require('amqplib');

/** @type {import('amqplib').Connection | null} */
let connection = null;

/** @type {import('amqplib').Channel} */
let channel = null;

const getRabbitMQConnection = async () => {
  if (connection) return connection;
  connection = await amqp.connect('amqp://guest:guest@rabbitmq:5672');
  return connection;
};

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
  getRabbitMQConnection,
  closeConnection,
};