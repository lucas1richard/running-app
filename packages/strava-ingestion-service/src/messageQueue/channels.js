const { getRabbitMQConnection } = require('./rabbitmq');

const exchangeNames = {
  ACTIVITY_SERVICE_UPDATES: 'activityService.updates',
}

const channelConfigs = {
  imageService: {
    exchangeName: exchangeNames.ACTIVITY_SERVICE_UPDATES,
    queueName: 'imageService',
    type: 'direct',
    channel: null,
  },
  stravaIngestionService: {
    exchangeName: exchangeNames.ACTIVITY_SERVICE_UPDATES,
    queueName: 'dataRequest',
    type: 'direct',
    routingKey: 'stravaIngestionService',
    channel: null,
  },
  fetchActivityDetails: {
    exchangeName: exchangeNames.ACTIVITY_SERVICE_UPDATES,
    queueName: 'fetchActivityDetails',
    type: 'direct',
    routingKey: 'fetchActivityDetails',
    channel: null,
  },
  fetchActivityStreams: {
    exchangeName: exchangeNames.ACTIVITY_SERVICE_UPDATES,
    queueName: 'fetchActivityStreams',
    type: 'direct',
    routingKey: 'fetchActivityStreams',
    channel: null,
  }
};

const getChannel = async (config) => {
  if (config.channel) return config.channel;

  const connection = await getRabbitMQConnection();
  const channel = await connection.createChannel();
  await channel.assertExchange(config.exchangeName, config.type, { durable: true });
  await channel.assertQueue(config.queueName, { durable: true });
  await channel.bindQueue(config.queueName, config.exchangeName, config.routingKey || '');
  config.channel = channel;

  return channel;
};

module.exports = {
  exchangeNames,
  channelConfigs,
  getChannel,
};
