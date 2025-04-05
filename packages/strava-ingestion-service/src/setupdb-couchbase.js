const create_nano = require('nano');

const {
  COUCHDB_USER: couchDbUser,
  COUCHDB_PASSWORD: couchDbPassword,
} = process.env;

// couchbase
const nano = create_nano(`http://${couchDbUser}:${couchDbPassword}@strava-couch-db:5984`);

const ACTIVITIES_DB = 'activities';
const ACTIVITIES_DETAIL_DB = 'activities-detail';
const STREAMS_DB = 'streams';

const activitiesDb = nano.db.use(ACTIVITIES_DB);
const activitiesDetailDb = nano.db.use(ACTIVITIES_DETAIL_DB);
const streamsDb = nano.db.use(STREAMS_DB);

const createIfNotExists = async (dbName) => {
  try {
    await nano.db.get(dbName);
  } catch (err) {
    console.log(err);
    await nano.db.create(dbName);
  }
};

const setupdb = async () => {
  await Promise.allSettled([
    createIfNotExists('_users'),
    createIfNotExists(ACTIVITIES_DB),
    createIfNotExists(ACTIVITIES_DETAIL_DB),
    createIfNotExists(STREAMS_DB),
  ]);
};

const bulkAddActivities = async (activities, batchSize = 100) => {
  const batches = [];

  // Split activities into batches
  for (let i = 0; i < activities.length; i += batchSize) {
    batches.push(activities.slice(i, i + batchSize));
  }

  // Process each batch sequentially
  for (const batch of batches) {
    await activitiesDb.bulk({
      docs: batch.map((activity) => ({
        _id: `${activity.id}`,
        ...activity,
      }))
    });
  }
};

const getAllActivities = async () => {
  const params = { include_docs: true, limit: 10000, descending: true };

  const body = await activitiesDb.list(params);
  const allRows = body
    ?.rows
    ?.map(({ doc } = {}) => doc) || [];

  allRows?.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));

  return allRows;
};

const getActivity = async (id) => {
  try {
    const activity = await activitiesDb.get(`${id}`);
    return activity;
  } catch (err) {
    return undefined;
  }
};

const destroyActivity = async (id) => {
  try {
    await activitiesDb.destroy(`${id}`);
  } catch (err) {
    console.log(err.message);
  }
};

const getActivityDetail = async (id) => {
  try {
    const activity = await activitiesDetailDb.get(`${id}`);
    return activity;
  } catch (err) {
    return undefined;
  }
};

const destroyActivityDetail = async (id) => {
  try {
    await activitiesDetailDb.destroy(`${id}`);
  } catch (err) {
    console.log(err.message);
  }
};

const addActivityDetail = async (activity) => {
  const res = await activitiesDetailDb.insert(activity, `${activity.id}`);
  return res;
};

const updateActivityDetail = async (activityId, detail) => {
  const existing = await activitiesDetailDb.get(`${activityId}`) || {};
  const res = await activitiesDetailDb.insert({ ...existing, ...detail }, `${activityId}`);
  return res;
};

const addStream = async (stream, documentId) => {
  const res = await streamsDb.insert(stream, `${documentId}`)
  return res;
};

const getStream = async (id) => {
  try {
    const stream = await streamsDb.get(`${id}`);
    return stream;
  } catch (err) {
    return undefined;
  }
};

const destroyStream = async (id) => {
  try {
    await streamsDb.destroy(`${id}`);
  } catch (err) {
    console.log(err.message);
  }
};

const getAllStreams = async () => {
  const params = { include_docs: true, limit: 10000, descending: true };
  const body = await streamsDb.list(params);
  return body?.rows?.map(({ doc } = {}) => doc) || [];
};

module.exports = {
  addActivityDetail,
  addStream,
  setupdb,
  bulkAddActivities,
  destroyActivity,
  destroyActivityDetail,
  destroyStream,
  getActivity,
  getStream,
  getAllStreams,
  getActivityDetail,
  getAllActivities,
  updateActivityDetail,
};
