import { Op } from 'sequelize';
import Activity from '../persistence/activities/model-activities.ts';
import CalculatedBestEfforts from '../persistence/activities/model-calculated-efforts.ts';

const getPRsByDate = async () => {
  const prsByDateArr = await CalculatedBestEfforts.findAll({
    where: {
      pr_rank: {
        [Op.not]: null,
      },
    },
    order: [['distance', 'ASC'], ['start_date_local', 'DESC']],
    group: ['name', 'start_date_local'],
    include: [
      {
        model: Activity,
        where: {
          hidden: {
            [Op.not]: true
          },
        },
        attributes: ['hidden'],
      }
    ],
  });

  const prsByDate = prsByDateArr.reduce((acc, pr) => {
    const name = pr.name;
    if (!acc[name]) {
      acc[name] = [];
    }
    acc[name].push(pr);
    return acc;
  }, {});

  return prsByDate;
};

export default getPRsByDate;
