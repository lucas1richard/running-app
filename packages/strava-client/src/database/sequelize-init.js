const Activity = require('./sequelize-activities');

const initSequelize = async () => {
  await Promise.allSettled([
    Activity.sync(),
  ]);
};

module.exports = {
  initSequelize,
};
