const deepmerge = require('deepmerge');
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
const USER_PREFERENCES_DB = 'user-preferences';
const ACTIVITY_PREFERENCES_DB = 'activity-preferences';

const activitiesDb = nano.db.use(ACTIVITIES_DB);
const activitiesDetailDb = nano.db.use(ACTIVITIES_DETAIL_DB);
const streamsDb = nano.db.use(STREAMS_DB);
const userPreferencesDb = nano.db.use(USER_PREFERENCES_DB);
const activityPreferencesDb = nano.db.use(ACTIVITY_PREFERENCES_DB);

const createIfNotExists = async (dbName) => {
  try {
    await nano.db.get(dbName);
  } catch (err) {
    console.trace(err);
    await nano.db.create(dbName);
  }
};

const setupdb = async () => {
  await Promise.allSettled([
    createIfNotExists('_users'),
    createIfNotExists(ACTIVITIES_DB),
    createIfNotExists(ACTIVITIES_DETAIL_DB),
    createIfNotExists(STREAMS_DB),
    createIfNotExists(USER_PREFERENCES_DB),
    createIfNotExists(ACTIVITY_PREFERENCES_DB),
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

const makeDeleteById = (db) => async (id) => {
  try {
    // First, get the current document to retrieve its _rev
    const activity = await db.get(id);

    // Then delete with the correct revision
    const response = await db.destroy(id, activity._rev);
    console.trace(`Successfully deleted ${this} ${id}`);
    return response;
  } catch (error) {
    if (error.statusCode === 404) {
      console.trace(`${this} ${id} not found, nothing to delete`);
      return { ok: true, id: id, notFound: true };
    }
    console.error(`Error deleting ${this} ${id}:`, error);
  }
}

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
    console.trace('getActivity', err);
    return undefined;
  }
};

const destroyActivity = makeDeleteById(activitiesDb);

const getActivityDetail = async (id) => {
  try {
    const activity = await activitiesDetailDb.get(`${id}`);
    return activity;
  } catch (err) {
    return undefined;
  }
};

const destroyActivityDetail = makeDeleteById(activitiesDetailDb);

const addActivityDetail = async (activity) => {
  const res = await activitiesDetailDb.insert(activity, `${activity.id}`);
  return res;
};

const updateActivityDetail = async (activityId, detail) => {
  const existing = await activitiesDetailDb.get(`${activityId}`) || {};
  const res = await activitiesDetailDb.insert({ ...existing, ...detail }, `${activityId}`);
  return res;
};

const getUserPreferences = async (userId) => {
  try {
    const preferences = await userPreferencesDb.get(`${userId}`);
    return preferences;
  } catch (err) {
    console.trace('getUserPreferences', err);
    return undefined;
  }
};

const getActivityPreferences = async (activityId) => {
  try {
    const preferences = await activityPreferencesDb.get(`${activityId}`);
    return preferences;
  } catch (err) {
    return undefined;
  }
};

const destroyActivityPreferences = makeDeleteById(activityPreferencesDb);

const updateUserPreferences = async (userId, preferences = {}) => {
  const existing = await getUserPreferences(userId) || {};
  const res = await userPreferencesDb.insert(deepmerge(existing, preferences), `${userId}`);
  return res;
};

const updateActivityPreferences = async (activityId, preferences = {}) => {
  const existing = await getActivityPreferences(activityId) || {};
  const res = await activityPreferencesDb.insert(deepmerge(existing, preferences), `${activityId}`);
  return res;
}

const addStream = async (stream, documentId) => {
  const res = await streamsDb.insert(stream, `${documentId}`)
  return res;
};

const getStream = async (id) => {
  try {
    const stream = await streamsDb.get(`${id}`);
    return stream;
  } catch (err) {
    console.trace('getStream', err);
    return undefined;
  }
};

const destroyStream = makeDeleteById(streamsDb);

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
  destroyActivityPreferences,
  destroyStream,
  getActivity,
  getStream,
  getAllStreams,
  getActivityDetail,
  getActivityPreferences,
  getAllActivities,
  getUserPreferences,
  updateActivityDetail,
  updateActivityPreferences,
  updateUserPreferences,
};
