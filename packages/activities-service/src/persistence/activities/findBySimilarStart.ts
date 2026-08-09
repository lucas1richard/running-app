import { Sequelize, Op } from 'sequelize';
import Activity from './model-activities.ts';
import { sequelizeCoordsDistance } from '../utils.ts';
import {
  findSimilarStartDistance,
} from '../../constants.ts';

const findBySimilarStart = async (activity, radius = findSimilarStartDistance.START_DISTANCE_CONSTRAINT) => {
  const sqlPoint = Sequelize.fn('Point', activity.start_latlng[0], activity.start_latlng[1]);
  const sqlCol = Sequelize.col('start_latlng');
  const startDistDiffFn = Sequelize.fn('ST_Distance', sqlCol, sqlPoint);
  const totalDistDiffFn = Sequelize.literal(`distance - ${activity.distance}`);
  const totalTimeDiffFn = Sequelize.literal(`elapsed_time - ${activity.elapsed_time}`);

  return Activity.scope('').findAll({
    attributes: [
      'name',
      'id',
      'start_date_local',
      [startDistDiffFn, 'start_distance'],
      [totalDistDiffFn, 'total_distance_diff'],
      [totalTimeDiffFn, 'total_time_diff'],
    ],
    where: {
      [Op.and]: {
        sport_type: activity.sport_type,
        // `ax` doesn't mean anything, just a placeholder
        ax: sequelizeCoordsDistance(activity.start_latlng, radius),
        [Op.not]: {
          id: activity.id, // not the same activity
        },
      },
    },
    order: [[startDistDiffFn, 'ASC']],
    group: ['id'],
  });
};

export default findBySimilarStart;
