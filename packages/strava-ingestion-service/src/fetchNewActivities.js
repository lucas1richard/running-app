// const addBestEffortsForActivity = require('./addBestEffortsForActivity');
const bulkAddActivitiesFromStrava = require('./bulkAddActivitiesFromStrava');
const fetchStrava = require('./fetchStrava');
const { getChannel, channelConfigs } = require('./messageQueue/channels');
const { bulkAddActivities/* , addActivityDetail, addStream */ } = require('./setupdb-couchbase');

const { imageService } = channelConfigs;


const fetchWorker = async (perPage, page) => {
  const activitiesList = await fetchStrava(`/athlete/activities?per_page=${perPage}&page=${page}`);
  await bulkAddActivities(activitiesList); // couchdb
  const addedRecords = await bulkAddActivitiesFromStrava(activitiesList); // mysql

  const channel = await getChannel(imageService);
  for (const record of addedRecords) {
    const msgSm = {
      activityId: record.id,
      routePath: record?.summary_polyline || record.map?.summary_polyline,
      size: '400x200',
    };
    channel.publish(imageService.exchangeName, '', Buffer.from(JSON.stringify(msgSm)));
  }

  // // ingest activity details
  // const activitiesDetails = await Promise.allSettled(addedRecords.map((record) => fetchStrava(`/activities/${record.id}`)));
  // const errors = activitiesDetails.filter((activityDetail) => activityDetail.status === 'rejected');
  // if (errors.length > 0) console.error('Errors fetching activity details:', errors);
  // const succeeded = activitiesDetails.filter((activityDetail) => activityDetail.status === 'fulfilled');
  // await Promise.allSettled(succeeded.map(({ value }) => addActivityDetail(value)));

  // // ingest activity streams
  // await Promise.allSettled(succeeded
  //   .map(({ value }) => fetchStrava(`/activities/${value.id}/streams?keys=${streamKeys.join(',')}`)
  //     .then((stream) => addStream({ stream }, value.id))
  //     .catch((err) => console.error('Error adding stream:', err))
  //   )
  // );
  // await Promise.allSettled(succeeded.map(({ value }) => addBestEffortsForActivity(value.id, value.best_efforts || [])));

  return addedRecords.map(({ id }) => id);
};

const fetchNewActivities = async ({ perPage = 100, page = 1, fetchAll = false } = {}) => {
  if (!fetchAll) {
    return fetchWorker(perPage, page);
  }

  const allActivities = [];
  let currentPage = page;
  let currentPerPage = perPage;
  let activitiesList = [];

  do {
    activitiesList = await fetchWorker(currentPerPage, currentPage);
    allActivities.push(...activitiesList);
    currentPage += 1;
  } while (activitiesList.length === currentPerPage);
}

module.exports = {
  fetchNewActivities,
};
