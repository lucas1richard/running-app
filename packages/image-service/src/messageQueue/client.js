const { getBoundedChannel } = require('./rabbitmq');

const dispatchFanout = async (exchangeName, msg) => {
  try {
    const channel = await getBoundedChannel(exchangeName, '', 'fanout');
    channel.publish(exchangeName, '', Buffer.from(msg));

    console.trace(` [x] Sent ${msg}`);
    return true;
  } catch (err) {
    console.error('Error sending message', err);
    return false;
  }
};

module.exports = {
  dispatchFanout,
};