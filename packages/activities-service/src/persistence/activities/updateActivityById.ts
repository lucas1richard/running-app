import Activity from './model-activities.ts';

const updateActivityById = async (id, fields) => {
  return Activity.update(fields, { where: { id } });
};

export default updateActivityById;
