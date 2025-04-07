const handleImage = require('../../handleImage');
const { getChannel, channelConfigs } = require('../channels');
const { getRabbitMQConnection } = require('../rabbitmq');

const imageDownloadListener = async (msg) => {
  const channel = await getChannel(channelConfigs.imageService);

  channel.consume(
    channelConfigs.imageService.queueName,
    (msg) => {
      if (msg.content) {
        const messageStr = msg.content.toString();
        const message = JSON.parse(messageStr);
        console.log(' [x] Received ', messageStr);

        // Process the message here
        const { activityId, routePath, size, maptype } = message;
        handleImage(activityId, routePath, size, maptype)
          .then(() => {
            console.log(`Image for activityId ${activityId} downloaded successfully`);
            channel.ack(msg);
          })
          .catch((error) => {
            console.error(`Error downloading image for activityId ${activityId}:`, error);
            channel.ack(msg);
          });
      }
    },
    { noAck: false }
  );

}

module.exports = {
  imageDownloadListener,
}