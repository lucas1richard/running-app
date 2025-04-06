const path = require('path');
const fs = require('fs');
const waitPort = require('wait-port');
const app = require('./app');
const PORT = require('./port');
const { googleAPIKey } = require('./constants');
const downloadImage = require('./downloadImage');
const { setupConsumers } = require('./messageQueue/consumers');
const { getChannel, channelConfigs } = require('./messageQueue/channels');
const handleImage = require('./handleImage');

app.get('*/routes/:img', async (req, res, next) => {
  const file = req.params.img; // the activityId is the file name, and file type is png
  const activityId = file.slice(0, file.length - 4);

  const {
    size = '900x450',
    maptype = 'roadmap',
    path: routepath = '',
  } = req.query;

  const rootDir = path.join(__dirname, 'static', size, maptype);
  const options = { root: rootDir };
  
  res.setHeader('Cache-Control', 'public, max-age=315576000');
  res.sendFile(file, options, async (err) => {
    if (err) {
      try {
        await handleImage(activityId, routepath, size, maptype);
        res.sendFile(file, options);
      } catch (error) {
        return next(err);
      }
    }
  });
});

app.use((err, req, res, next) => {
  res.sendStatus(500);
});

(async () => {
  try {
    await app.listen(PORT);
    console.log(`image-service listening on port ${PORT}`);

    await waitPort({
      host: 'rabbitmq',
      port: 5672,
      timeout: 10000,
      waitForDns: true,
    });

    await setupConsumers();

    const channel = await getChannel(channelConfigs.imageService);
  } catch (err) {
    console.log(err);
  }
})();
