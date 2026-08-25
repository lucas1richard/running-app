import { getActivityDetail } from '../persistence/setupdb-couchbase.ts';
import CalculatedBestEfforts from '../persistence/activities/model-calculated-efforts.ts';
import receiver from '../messageQueue/receiver.ts';

const getActivityDetails = async (activityId) => {
  const detail = await getActivityDetail(activityId) || {};

  if (detail) {
    const best_efforts = await CalculatedBestEfforts.findAll({ where: { activityId } });
    return { ...detail, best_efforts };
  }
  await receiver.sendAndAwaitMessage('stravaIngestionService', 'details', activityId);

  const addedDetail = await getActivityDetail(activityId);
  const calc_best_efforts = await CalculatedBestEfforts.findAll({ where: { activityId } });
  if (addedDetail) {
    return { ...addedDetail, best_efforts: calc_best_efforts };
  }
};

export {
  getActivityDetails,
};
