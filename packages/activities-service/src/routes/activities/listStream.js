const { Router } = require('express');
const { findAllActivitiesStream, findActivitiesByIdStream } = require('../../persistence/activities');
const { logger } = require('../../utils/logger');
const receiver = require('../../messageQueue/receiver');

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
      const correlationId = receiver.generateCorrelationId();
      receiver.sendMessage('stravaIngestionService', 'basic', { perPage, page }, correlationId);
      const addedRecordsIds = await receiver.waitForMessage('activitiesService', 'basic-response', correlationId);
      await receiver.waitForMessage('activitiesService', 'streams-response', correlationId);

      // logger.info('Waiting for new activities with correlationId:', correlationId);
      // const addedRecordsIds = await receiver
      //   .sendAndAwaitMessage('stravaIngestionService', 'basic', { perPage, page });

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

module.exports = {
  listStreamRouter: router,
};