const { Op } = require('sequelize');
const Activity = require('./model-activities');

const bulkAddActivitiesFromStrava = async (stravaActivities) => {
  if (stravaActivities.length > 0) {
    try {
      const existingRecords = await Activity.scope('').findAll({
        where: {
          [Op.or]: stravaActivities.map(({ id }) => ({ id })),
        }
      });
      const existingMap = existingRecords.reduce((a, r) => {
        a[r.id] = true;
        return a;
      }, {});

      console.trace(existingMap)

      const records = await Activity.bulkCreate(stravaActivities
        .filter(a => !existingMap[a.id])
        .map((av) => ({
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

      console.trace(`Bulk Add Activities Complete - ${records.length} new records`);

      return records;
    } catch (err) {
      console.trace(err);
      return [];
    }
  }
};

module.exports = bulkAddActivitiesFromStrava;
