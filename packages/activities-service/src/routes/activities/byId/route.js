const { Router } = require('express');
const { makeCompressedRoute } = require('../../../controllers/makeCompressedRoute');

const router = new Router();

router.get('/:id/route', async (req, res) => {
  const compressionLevel = req.query.compressionLevel || 0;
  if (compressionLevel < 0 || compressionLevel > 0.1) {
    return res.status(400).send('Compression level must be between 0 and 0.1');
  }
  const activityId = req.params?.id;

  try {
    const compressedRoute = await makeCompressedRoute(activityId, compressionLevel);
    res.json(compressedRoute);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = {
  routeRouter: router,
};
