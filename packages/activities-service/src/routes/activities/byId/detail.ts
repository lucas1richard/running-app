import { Router } from 'express';
import { getActivityDetails } from '../../../controllers/getActivityDetails.ts';
import { calculateActivityBestEfforts } from '../../../controllers/calculateActivityBestEfforts.ts';

const router = Router();

router.get('/:id/detail', async (req, res) => {
  try {
    const activityId = req.params?.id;
    const activity = await getActivityDetails(activityId);
    const bestEfforts = await calculateActivityBestEfforts(activityId);
    res.json({
      ...activity,
      bestEfforts,
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

export {
  router as detailsRouter,
};
