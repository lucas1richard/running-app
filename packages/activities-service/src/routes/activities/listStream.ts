import { Router } from 'express';
import { findAllActivitiesStream, findActivitiesByIdStream } from '../../persistence/activities/index.ts';
import { logger } from '../../utils/logger.ts';
import { ingestIntervalICUActivities } from '../../intervals-icu-ingestion/ingestor.ts';

const router = Router();

router.get('/listStream', async (req, res) => {
  const forceFetch = req.query.force;
  const page = req.query.page || 1;
  const perPage = req.query.per_page || 100;

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  try {
    if (forceFetch) {
      logger.info('Waiting for new activities...');
      const addedRecordsIds = await ingestIntervalICUActivities(100);

      const readableStream = await findActivitiesByIdStream(addedRecordsIds);
      readableStream.resume();

      for await (const batch of readableStream) {
        res.write(`data: ${JSON.stringify(batch)}\n\n`);
      }
      logger.info('End of stream');
      res.write('event: close\ndata: Stream closed\n\n');

      res.end();
      return;
    }

    const readableStream = await findAllActivitiesStream();
    readableStream.resume();

    for await (const batch of readableStream) {
      res.write(`data: ${JSON.stringify(batch)}\n\n`);
    }
    logger.info('End of stream');
    res.write('event: close\ndata: Stream closed\n\n');

    res.end();
  } catch (err) {
    console.error('Error in streaming activities:', err);
    res.write('event: error\ndata: Error in streaming activities\n\n');
    res.end();
  }
});

export {
  router as listStreamRouter,
};