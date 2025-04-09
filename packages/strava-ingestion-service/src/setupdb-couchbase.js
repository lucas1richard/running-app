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

const setupCouchDb = async () => {
  await Promise.all([
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

const addActivityDetail = async (activity) => {
  const res = await activitiesDetailDb.insert(activity, `${activity.id}`);
  return res;
};

const addStream = async (stream, documentId) => {
  const res = await streamsDb.insert(stream, `${documentId}`)
  return res;
};

module.exports = {
  addActivityDetail,
  addStream,
  setupCouchDb,
  bulkAddActivities,
};
