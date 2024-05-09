const create_nano = require('nano');
// setup the database if there is one

// couchbase
const nano = create_nano('http://admin:password@strava-couch-db:5984');

const createIfNotExists = async (dbName) => {
  try {
    await nano.db.get(dbName);
  } catch (err) {
    await nano.db.create(dbName);
  }
};

const setupdb = async () => {
  await createIfNotExists('_users');
  await createIfNotExists('activities');
  await createIfNotExists('streams');
};

const bulkAddActivities = async (activities) => {
  const activitiesDb = await nano.db.use('activities');
  await activitiesDb.bulk({ docs: activities.map((activity) => ({
    _id: `${activity.id}`,
    ...activity,
  }))});
};

module.exports = {
  setupdb,
  bulkAddActivities,
};

// sqlite

// mysql