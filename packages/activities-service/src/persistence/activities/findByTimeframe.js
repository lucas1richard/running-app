import { Sequelize } from 'sequelize';
import Activity from './model-activities.js';

/**
 *
 * @param {number} msOffset the number of milliseconds to offset from the current time
 * @param {number} rowLimit max number of rows to return
 */
const findByTimeframe = async (msOffset = 365 * 24 * 60 * 60 * 1000, rowLimit = 200) => {
  return Activity.findAll({
    where: {
      // sport_type: 'Run',
      start_date: {
        // within the past year
        [Sequelize.Op.gte]: new Date().getTime() - msOffset,
      }
    },
    limit: rowLimit,
  });
};

export default findByTimeframe;
