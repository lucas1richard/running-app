const Activity = require('./model-activities');

const bulkAddActivitiesFromStrava = async (stravaActivities) => {
  if (stravaActivities.length > 0) {
    try {
      const records = await Activity.bulkCreate(stravaActivities.map((av) => ({
        ...av,
        start_latlng: {
          type: 'Point',
          coordinates: av.start_latlng?.length ? av.start_latlng : [0, 0],
        },
        end_latlng: {
          type: 'Point',
          coordinates: av.end_latlng?.length ? av.end_latlng : [0, 0],
        },
        summary_polyline: av.map?.summary_polyline,
      })), {
        ignoreDuplicates: true,
        logging: false,
      });

      const newRecords = records.filter((record) => record.isNewRecord);

      console.log(`Bulk Add Activities Complete - ${newRecords.length} new records`);

      return newRecords;
    } catch (err) {
      console.log(err);
      return [];
    }
  }
};

module.exports = bulkAddActivitiesFromStrava;
