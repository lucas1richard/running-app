import app from './app.js';
import PORT from './port.js';

import { setupdb } from './persistence/setupdb-couchbase.js';
import { initMysql } from './persistence/setupdb-mysql.js';
import { initSequelize } from './persistence/sequelize-init.js';

import { getRabbitMQConnection } from './messageQueue/rabbitmq.js';

import { activitiesRouter } from './routes/activities/index.js';
import { adminRouter } from './routes/admin.js';
import { authRouter } from './routes/authenticate.js';
import { heartzonesRouter } from './routes/heartzones.js';
import { analysisRouter } from './routes/analysis/index.js';
import { userRouter } from './routes/user.js';
import { segmentsRouter } from './routes/segments.js';
import { activityRoutesRouter } from './routes/activity-routes.js';
import { routeCoordinatesRouter } from './routes/routeCoordinates.js';
import receiver from './messageQueue/receiver.js';

import { logger } from './utils/logger.js';
import { getChannel, channelConfigs } from './messageQueue/channels.js';
import fetchIntervalsIcu from './intervals-icu-ingestion/fetch-intervalsicu.ts';
// import addAllCompressedRoutes from './functions/addAllCompressedRoutes.js';

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

    const acts = await fetchIntervalsIcu('/activities', { queryParams: { oldest: '2026-06-29' } });
    console.log(acts.length)

    await app.listen(PORT);

    // await addAllCompressedRoutes();

    logger.info({ message: `strava-client listening on port ${PORT}` });
  } catch (err) {
    logger.error({ message: 'Error starting strava-client' });
    console.trace(err)
  }
})();
