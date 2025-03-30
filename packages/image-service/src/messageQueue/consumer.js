const { getBoundedChannel } = require('./rabbitmq');

const consumeFromFanout = async (exchangeName, queueName = '', callback) => {
  const channel = await getBoundedChannel(exchangeName, queueName, 'fanout');

  await channel.consume(queueName, (msg) => {
    if (msg.content) callback(msg.content.toString());
  }, { noAck: true });
  console.log(` [*] Waiting for messages in ${exchangeName}. To exit press CTRL+C`);
  return channel;
}

module.exports = {
  consumeFromFanout,
};