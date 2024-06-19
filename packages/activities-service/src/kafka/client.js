const { Kafka, logLevel } = require('kafkajs');
const topics = require('./topics');
const { setupKafkaConsumers } = require('./consumers');

const kafkaClient = new Kafka({
  clientId: 'strava-client',
  brokers: [`running-app-kafka:9092`],
  retry: {
    initialRetryTime: 1000,
    retries: 3,
  },
  logLevel: logLevel.ERROR,
})

const producer = kafkaClient.producer();
const consumer = kafkaClient.consumer({ groupId: 'strava-client' });

const defaultTopicConfig = { numPartitions: 1, replicationFactor: 1 };
const allTopics = {
  ...Object.fromEntries(Object.values(topics).map((topic) => [topic, { topic, ...defaultTopicConfig }])),
  // Add more topics or override topics here
};

const run = async () => {
  const admin = kafkaClient.admin({
    retry: {
      initialRetryTime: 1000,
      retries: 3,
    },
  });
  await admin.connect();

  const existingTopics = await admin.listTopics();
  const topicsToCreate = Object.keys(allTopics).filter((topic) => !existingTopics.includes(topic));
  if (topicsToCreate.length) {
    await admin.createTopics({
      topics: topicsToCreate.map((topic) => allTopics[topic]),
      waitForLeaders: true,
    });
  }

  await setupKafkaConsumers(kafkaClient);
};

module.exports = {
  kafkaClient,
  producer,
  consumer,
  run,
};
