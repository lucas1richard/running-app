const handleImage = require('../../handleImage');
const { getChannel, channelConfigs } = require('../channels');
const { getRabbitMQConnection } = require('../rabbitmq');

const listListener = async (msg) => {
  const channel = await getChannel(channelConfigs.imageService);

  channel.consume(
    channelConfigs.imageService.queueName,
    (msg) => {
      if (msg.content) {
        const messageStr = msg.content.toString();
        const message = JSON.parse(messageStr);
        console.trace(' [x] Received ', messageStr);

        channel.ack(msg);
        
        // setTimeout(() => {
        //   channel.publish(
        //     channelConfigs.imageService.exchangeName,
        //     '',
        //     Buffer.from(JSON.stringify({ ...message, counter: (message.counter || 0) + 1 }))
        //   );
        // }, 1000);
      }
    },
    { noAck: false }
  );

}

module.exports = {
  listListener,
}