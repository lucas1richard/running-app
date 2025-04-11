const { Router } = require('express');
const { findAllActivitiesStream, findActivitiesByIdStream } = require('../../persistence/activities');
const { logger } = require('../../utils/logger');
const { getGrpcClient } = require('../../grpctest');

const router = Router();

const stravaIngestionService = getGrpcClient({
  serviceName: 'strava-ingestion-service',
  servicePort: '50052',
  protoPackage: 'stravaIngestion',
  protoService: 'StravaIngestion'
});

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
      const addedRecords = await new Promise((resolve, reject) => stravaIngestionService
        .fetchNewActivities({ perPage, page }, (error, response) => {
          if (error) reject(error);
          else resolve(response.activityId);
        }));

      const readableStream = await findActivitiesByIdStream(addedRecords.map((record) => record.id));
      readableStream.resume();

      for await (const batch of readableStream) {
        res.write(`data: ${JSON.stringify(batch)}\n\n`); // send each row immediately
      }
      logger.info('End of stream');
      res.write('event: close\ndata: Stream closed\n\n');

      res.end();
      return;
    }

    const readableStream = await findAllActivitiesStream();
    readableStream.resume();

    for await (const batch of readableStream) {
      res.write(`data: ${JSON.stringify(batch)}\n\n`); // send each row immediately
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