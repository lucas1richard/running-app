const { getRabbitMQConnection } = require('./rabbitmq');

const exchangeNames = {
  ACTIVITY_SERVICE_UPDATES: 'activityService.updates',
}

const channelConfigs = {
  stravaIngestionService: {
    exchangeName: exchangeNames.ACTIVITY_SERVICE_UPDATES,
    queueName: 'dataRequest',
    type: 'direct',
    routingKey: 'stravaIngestionService',
    channel: null,
  },
  imageService: {
    exchangeName: exchangeNames.ACTIVITY_SERVICE_UPDATES,
    queueName: 'imageService',
    type: 'direct',
    channel: null,
  },
  activitiesService: {
    exchangeName: 'activitiesService',
    queueName: 'responses',
    routingKey: 'responses',
    type: 'direct',
    channel: null,
  },
};

const getChannelSync = (config) => {
  if (config.channel) return config.channel;
  throw new Error('Channel not initialized');
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
  getChannelSync,
};

