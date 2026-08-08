import { Router } from 'express';
import { getComparedRoutes } from '../controllers/getComparedRoutes.js';
import findByTimeframe from '../persistence/activities/findByTimeframe.js';
import { findRelationsBySimilarRoute, findActivityById } from '../persistence/activities/index.js';

const router = Router();

router.get('/network', async (req, res) => {
  try {
    const activityId = req.query?.activityId;
    if (activityId) {
      await getComparedRoutes(activityId);
      const network = await findRelationsBySimilarRoute(activityId);
      return res.json(network);
    }

    const baseActivity = await findActivityById(activityId);
    const allActivities = await findByTimeframe();
    const allActivityIds = allActivities.map((activity) => activity.id);

    await Promise.allSettled(allActivityIds.map(getComparedRoutes));
    const network = await findRelationsBySimilarRoute(baseActivity);

    return res.json(network)
  } catch (err) {
    console.trace(err)
    res.status(500).send(err.message);
  }
});

export {
  router as activityRoutesRouter,
};
