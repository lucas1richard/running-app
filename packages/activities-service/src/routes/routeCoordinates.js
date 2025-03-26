const { Router } = require('express');
const router = Router();

const { getAllCoordinatesStream } = require('../persistence/routeCoordinates');

router.get('/heatmap', async (req, res) => {
  try {
    const coords = await getAllCoordinatesStream();
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
