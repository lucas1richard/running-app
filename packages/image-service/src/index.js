const path = require('path');
const fs = require('fs');
const waitPort = require('wait-port');
const app = require('./app');
const PORT = require('./port');
const { googleAPIKey } = require('./constants');
const downloadImage = require('./downloadImage');
const { setupConsumers } = require('./messageQueue/consumers');

app.get('*/routes/:img', async (req, res, next) => {
  const file = req.params.img;

  const {
    size = '900x450',
    maptype = 'roadmap',
    path: routepath = '',
  } = req.query;

  const rootDir = path.join(__dirname, 'static', size, maptype);
  const options = {
    root: rootDir
  };

  res.sendFile(file, options, async (err) => {
    if (err) {
      // console.log(err);
      // res.sendStatus(400)
      try {
        // get the image from google maps
        fs.mkdirSync(rootDir, { recursive: true });
        console.log(`https://maps.googleapis.com/maps/api/staticmap?size=${size}&maptype=${maptype}&path=${routepath}&key=${googleAPIKey}`);
        await downloadImage(
          `https://maps.googleapis.com/maps/api/staticmap?size=${size}&maptype=${maptype}&path=${routepath}&key=${googleAPIKey}`,
          path.join(__dirname, 'static', size, maptype, file)
        )
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
  } catch (err) {
    console.log(err);
  }
})();
