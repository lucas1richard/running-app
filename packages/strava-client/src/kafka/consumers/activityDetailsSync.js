const ActivitySegment = require('../../persistence/sequelize-activity-segments');
const AthleteSegment = require('../../persistence/sequelize-athlete-segments');
const { getActivityDetail } = require('../../persistence/setupdb-couchbase');
const { ACTIVITY_PULL } = require('../topics');

const syncActivityDetails = async (activityId) => {
  const details = await getActivityDetail(activityId);

  const segmentEfforts = details?.segment_efforts || [];
  try {
    await AthleteSegment.bulkCreate(segmentEfforts.map(({ segment: se, ...rest }) => ({
      ...rest,
      start_date: new Date(rest.start_date),
      activityId: activityId,
      activitySegmentId: se.id,
    }), {
      ignoreDuplicates: true,
      logging: false,
    }), {
      ignoreDuplicates: true,
      logging: false,
    });
    console.log('Athlete segments added');
    console.log('Now adding activity segments');
    await ActivitySegment.bulkCreate(segmentEfforts.map(({ segment: se }) => ({
      ...se,
      start_latlng: {
        type: 'Point',
        coordinates: se.start_latlng?.length ? se.start_latlng : [0,0],
      },
      end_latlng: {
        type: 'Point',
        coordinates: se.end_latlng?.length ? se.end_latlng : [0,0],
      },
      activityId: activityId,
    })), {
      ignoreDuplicates: true,
      logging: false,
    });
  } catch (err) {
    console.error(err);
  }
  // add to the database
  // add to the join table for activity and segment
};

const activityDetailsSync = async (kafkaClient) => {
  const consumer = kafkaClient.consumer({ groupId: 'strava-client' });
  await consumer.connect();
  await consumer.subscribe({ topic: ACTIVITY_PULL, fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const value = JSON.parse(message.value);
      console.log({
        topic,
        partition,
        offset: message.offset,
        value,
      });
      await syncActivityDetails(value.id);
    },
  });

  // add segments to database
  // add to the join table for activity and segment
};

module.exports = {
  activityDetailsSync,
};