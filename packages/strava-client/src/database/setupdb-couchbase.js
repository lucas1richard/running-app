const create_nano = require('nano');
// setup the database if there is one

// couchbase
const nano = create_nano('http://admin:password@strava-couch-db:5984');

const ACTIVITIES_DB = 'activities';
const ACTIVITIES_DETAIL_DB = 'activities-detail';
const STREAMS_DB = 'streams';

const createIfNotExists = async (dbName) => {
  try {
    await nano.db.get(dbName);
  } catch (err) {
    await nano.db.create(dbName);
  }
};

const setupdb = async () => {
  await createIfNotExists('_users');
  await createIfNotExists(ACTIVITIES_DB);
  await createIfNotExists(ACTIVITIES_DETAIL_DB);
  await createIfNotExists(STREAMS_DB);
};

const bulkAddActivities = async (activities) => {
  const activitiesDb = await nano.db.use(ACTIVITIES_DB);
  await activitiesDb.bulk({ docs: activities.map((activity) => ({
    _id: `${activity.id}`,
    ...activity,
  }))});
};

const getActivity = async (id) => {
  try {
    const activities = await nano.db.use(ACTIVITIES_DB);
    const activity = await activities.get(`${id}`);
    return activity;
  } catch (err) {}
};

const getActivityDetail = async (id) => {
  try {
    const activities = await nano.db.use(ACTIVITIES_DETAIL_DB);
    const activity = await activities.get(`${id}`);
    return activity;
  } catch (err) {}
};

const addActivityDetail = async (activity) => {
  const details = await nano.db.use(ACTIVITIES_DETAIL_DB);
  const res = await details.insert(activity, `${activity.id}`);
  return res;
};

module.exports = {
  addActivityDetail,
  setupdb,
  bulkAddActivities,
  getActivity,
  getActivityDetail,
};

// sqlite

// mysql