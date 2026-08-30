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
import { mcpRouter } from './routes/mcp/index.ts';
import { segmentsRouter } from './routes/segments.ts';
import { activityRoutesRouter } from './routes/activity-routes.ts';
import { routeCoordinatesRouter } from './routes/routeCoordinates.ts';
import receiver from './messageQueue/receiver.ts';

import { logger } from './utils/logger.ts';
import { getChannel, channelConfigs } from './messageQueue/channels.ts';
// import fetchIntervalsIcu from './intervals-icu-ingestion/fetch-intervalsicu.ts';
// import fetchIntervalsIcuStreams from './intervals-icu-ingestion/fetchIntervalsIcuStreams.ts';
// import { ingestIntervalICUActivities } from './intervals-icu-ingestion/ingestor.ts';
// import { deleteActivity } from './controllers/deleteActivity.ts';
import { calculateBestEffortsForNewActivities } from './intervals-icu-ingestion/calculateBestEffortsForNewActivities.ts';
import { llmChatRouter } from './routes/llm-chat/index.ts';
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
app.use('/heartzones', heartzonesRouter);
app.use('/analysis', analysisRouter);
app.use('/user', userRouter);
app.use('/segments', segmentsRouter);
app.use('/routes', activityRoutesRouter);
app.use('/routeCoordinates', routeCoordinatesRouter);
app.use('/mcp', mcpRouter);
app.use('/llm-chat', llmChatRouter);

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

    // | i164996687  | 2026-07-11 15:58:27 |
    // | i164996810  | 2026-07-08 20:16:30 |
    // | i164997049  | 2026-07-05 07:58:29 |
    // | i165460896  | 2026-07-13 20:25:23 |
    // | i166972958  | 2026-07-18 13:48:57 |
    // | i168616750  | 2026-07-23 18:18:42 |
    // | i172564027  | 2026-08-04 20:02:52 |
    // | i174947293  | 2026-08-11 20:36:48 |
    // | i176429326  | 2026-08-16 07:59:27 |

    const newIds = [
      164996687,
      164996810,
      164997049,
      165460896,
      166972958,
      168616750,
      172564027,
      174947293,
      176429326,
    ];

    await calculateBestEffortsForNewActivities(newIds);

    await app.listen(PORT);

    // await addAllCompressedRoutes();

    logger.info({ message: `strava-client listening on port ${PORT}` });
  } catch (err) {
    logger.error({ message: 'Error starting strava-client' });
    console.trace(err);
  }
})();
