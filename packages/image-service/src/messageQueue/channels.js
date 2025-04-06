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
  activitiesService: {
    exchangeName: 'Activities',
    queueName: '',
    type: 'fanout',
  },
};

const getChannel = async (config) => {
  if (config.channel) return config.channel;

  const connection = await getRabbitMQConnection();
  const channel = await connection.createChannel();
  await channel.assertExchange(config.exchangeName, config.type, { durable: true });
  await channel.assertQueue(config.queueName, { durable: true });
  await channel.bindQueue(config.queueName, config.exchangeName, '');
  config.channel = channel;

  return channel;
};

module.exports = {
  exchangeNames,
  channelConfigs,
  getChannel,
};
