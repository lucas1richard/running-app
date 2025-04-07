const Activity = require('./model-activities');

const updateActivityById = async (id, fields) => {
  return Activity.update(fields, { where: { id } });
};

module.exports = updateActivityById;
