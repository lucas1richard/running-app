import { Router } from 'express';
import { getComparedSegments } from './activities/byId/segments.ts';
import {
  findAllActivities,
  findRelationsBySimilarSegments,
} from '../persistence/activities/index.ts';

const router = Router();

router.get('/network', async (req, res) => {
  try {
    const allActivities = await findAllActivities();
    const allActivityIds = allActivities.map((activity) => activity.id);

    await Promise.allSettled(allActivityIds.map(getComparedSegments));

    const network = await findRelationsBySimilarSegments();
    res.json(network);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

export {
  router as segmentsRouter,
};
