const amqp = require('amqplib');
const waitPort = require('wait-port');

let connection = null;

let channel = null;

const getRabbitMQConnection = async () => {
  try {
    if (connection) return connection;
    await waitPort({ host: 'rabbitmq', port: 5672, timeout: 10000, waitForDns: true });
    connection = await amqp.connect('amqp://guest:guest@rabbitmq:5672');
    return connection;
  } catch (err) {
    console.trace(err);
  }
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