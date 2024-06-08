const deepmerge = require('deepmerge');
const create_nano = require('nano');
// setup the database if there is one

// couchbase
const nano = create_nano('http://admin:password@strava-couch-db:5984');

const ACTIVITIES_DB = 'activities';
const ACTIVITIES_DETAIL_DB = 'activities-detail';
const STREAMS_DB = 'streams';
const USER_PREFERENCES_DB = 'user-preferences';
const ACTIVITY_PREFERENCES_DB = 'activity-preferences';

const createIfNotExists = async (dbName) => {
  try {
    await nano.db.get(dbName);
  } catch (err) {
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

const bulkAddActivities = async (activities) => {
  const activitiesDb = await nano.db.use(ACTIVITIES_DB);
  await activitiesDb.bulk({ docs: activities.map((activity) => ({
    _id: `${activity.id}`,
    ...activity,
  }))});
};

const getAllActivities = async () => {
  const db = await nano.db.use(ACTIVITIES_DB);
  const params = { include_docs: true, limit: 10000, descending: true };

  const body = await db.list(params);
  const allRows = body
    ?.rows
    ?.map(({ doc } = {}) => doc) || [];

  allRows?.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));

  return allRows;
};

const getActivityDetail = async (id) => {
  try {
    const activities = await nano.db.use(ACTIVITIES_DETAIL_DB);
    const activity = await activities.get(`${id}`);
    return activity;
  } catch (err) {
    return undefined;
  }
};

const addActivityDetail = async (activity) => {
  const details = await nano.db.use(ACTIVITIES_DETAIL_DB);
  const res = await details.insert(activity, `${activity.id}`);
  return res;
};

const updateActivityDetail = async (activityId, detail) => {
  const details = await nano.db.use(ACTIVITIES_DETAIL_DB);
  const existing = await details.get(`${activityId}`) || {};
  const res = await details.insert({ ...existing, ...detail }, `${activityId}`);
  return res;
};

const getUserPreferences = async (userId) => {
  try {
    const db = await nano.db.use(USER_PREFERENCES_DB);
    const preferences = await db.get(`${userId}`);
    return preferences;
  } catch (err) {
    return undefined;
  }
};

const getActivityPreferences = async (activityId) => {
  try {
    const db = await nano.db.use(ACTIVITY_PREFERENCES_DB);
    const preferences = await db.get(`${activityId}`);
    return preferences;
  } catch (err) {
    return undefined;
  }
};

const updateUserPreferences = async (userId, preferences = {}) => {
  const db = await nano.db.use(USER_PREFERENCES_DB);
  const existing = await getUserPreferences(userId) || {};
  const res = await db.insert(deepmerge(existing, preferences), `${userId}`);
  return res;
};

const updateActivityPreferences = async (activityId, preferences = {}) => {
  const db = await nano.db.use(ACTIVITY_PREFERENCES_DB);
  const existing = await getActivityPreferences(activityId) || {};
  const res = await db.insert(deepmerge(existing, preferences), `${activityId}`);
  return res;
}

const addStream = async (stream, documentId) => {
  const db = await nano.db.use(STREAMS_DB);

  const res = await db.insert(stream, `${documentId}`)
  return res;
};

const getStream = async (id) => {
  try {
    const db = await nano.db.use(STREAMS_DB);
    const stream = await db.get(`${id}`);
    return stream;
  } catch (err) {
    return undefined;
  }
};

const getAllStreams = async () => {
  const db = await nano.db.use(STREAMS_DB);
  const params   = { include_docs: true, limit: 10000, descending: true };

  const body = await db.list(params);
  return body?.rows?.map(({ doc } = {}) => doc) || [];
};

module.exports = {
  addActivityDetail,
  addStream,
  setupdb,
  bulkAddActivities,
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
