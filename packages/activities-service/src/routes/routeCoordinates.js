import { Router } from 'express';
const router = Router();

import { getAllCoordinatesStream } from '../persistence/routeCoordinates/index.js';

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

export {
  router as routeCoordinatesRouter,
};
