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
  activitiesService: {
    exchangeName: 'activitiesService',
    queueName: 'responses',
    routingKey: 'responses',
    type: 'direct',
    channel: null,
  },
};

const closeConnection = async () => {
  if (channelConfigs.imageService.channel) await channelConfigs.imageService.channel.close();
  if (channelConfigs.stravaIngestionService.channel) await channelConfigs.stravaIngestionService.channel.close();
  if (channelConfigs.fetchActivityDetails.channel) await channelConfigs.fetchActivityDetails.channel.close();
  if (channelConfigs.fetchActivityStreams.channel) await channelConfigs.fetchActivityStreams.channel.close();
};

process.on('SIGINT', closeConnection);
process.on('SIGTERM', closeConnection);

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
