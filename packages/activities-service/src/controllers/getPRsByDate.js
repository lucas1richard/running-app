const { Op } = require('sequelize');
const Activity = require('../persistence/activities/model-activities');
const CalculatedBestEfforts = require('../persistence/activities/model-calculated-efforts');

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

module.exports = getPRsByDate;
