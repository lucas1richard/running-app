const { Router } = require('express');
const router = Router();

const { getAllCoordinatesStream } = require('../persistence/routeCoordinates');

router.get('/heatmap', async (req, res) => {
  try {
    const { referenceTime: refTime, timeframe } = req.query;
    let referenceTime = refTime ? new Date(refTime).toISOString() : undefined;
    if (timeframe && !referenceTime) {
      referenceTime = new Date().toISOString();
    }
    const coords = await getAllCoordinatesStream(referenceTime, timeframe);
    coords.resume();

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Connection': 'keep-alive'
    });

    for await (const batch of coords) {
      res.write(`data:${JSON.stringify(batch)}\n\n`);
    }

    res.write('event: close\ndata: Stream closed\n\n');
    res.end();
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

module.exports = {
  routeCoordinatesRouter: router,
};
