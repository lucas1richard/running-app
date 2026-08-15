import app from './app.ts';
import PORT from './port.ts';

import { setupdb } from './persistence/setupdb-couchbase.ts';
import { initMysql } from './persistence/setupdb-mysql.ts';
import { initSequelize } from './persistence/sequelize-init.ts';

import { getRabbitMQConnection } from './messageQueue/rabbitmq.ts';

import { activitiesRouter } from './routes/activities/index.ts';
import { adminRouter } from './routes/admin.ts';
import { authRouter } from './routes/authenticate.ts';
import { heartzonesRouter } from './routes/heartzones.ts';
import { analysisRouter } from './routes/analysis/index.ts';
import { userRouter } from './routes/user.ts';
import { segmentsRouter } from './routes/segments.ts';
import { activityRoutesRouter } from './routes/activity-routes.ts';
import { routeCoordinatesRouter } from './routes/routeCoordinates.ts';
import receiver from './messageQueue/receiver.ts';

import { logger } from './utils/logger.ts';
import { getChannel, channelConfigs } from './messageQueue/channels.ts';
import fetchIntervalsIcu from './intervals-icu-ingestion/fetch-intervalsicu.ts';
import fetchIntervalsIcuStreams from './intervals-icu-ingestion/fetchIntervalsIcuStreams.ts';
import { ingestIntervalICUActivities } from './intervals-icu-ingestion/ingestor.ts';
import { deleteActivity } from './controllers/deleteActivity.ts';
// import addAllCompressedRoutes from './functions/addAllCompressedRoutes.ts';

receiver.onActivityId(({ activityId, type, correlationId }) => {
  logger.info(
    `Received activityId event: ${activityId} from message type ${type}`,
    {
      service: 'activities-service',
      correlationId,
      type,
      activityId,
    }
  );
});

app.use('/activities', activitiesRouter);
app.use('/admin', adminRouter);
app.use('/auth', authRouter);
app.use('/auth', authRouter);
app.use('/heartzones', heartzonesRouter);
app.use('/analysis', analysisRouter);
app.use('/user', userRouter);
app.use('/segments', segmentsRouter);
app.use('/routes', activityRoutesRouter);
app.use('/routeCoordinates', routeCoordinatesRouter);

(async () => {
  try {
    await setupdb();
    await initMysql();
    await initSequelize();

    await getRabbitMQConnection();
    await Promise.all([
      getChannel(channelConfigs.stravaIngestionService),
      getChannel(channelConfigs.activitiesService)
    ]);

    // const acts = await fetchIntervalsIcu('/activities', { queryParams: { oldest: '2026-06-29' } });
    // const acts = await fetchIntervalsIcuStreams('i175584391')
    // console.log(acts);
    // await ingestIntervalICUActivities(100)

    await app.listen(PORT);

    // await addAllCompressedRoutes();

    logger.info({ message: `strava-client listening on port ${PORT}` });
  } catch (err) {
    logger.error({ message: 'Error starting strava-client' });
    console.trace(err);
  }
})();
