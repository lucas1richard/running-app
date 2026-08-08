// find by similar route
// - distance
// - start location
// - max/min values
//  - altitude
//  -
//  - lat,long

import { Router } from 'express';
import { findActivityById } from '../../persistence/activities/index.js';
import findSimilarStartDistance from '../../persistence/activities/findSimilarStartDistance.js';

const router = Router();

router.post('/by-route', async (req, res) => {
  try {
    const id = req.body?.id;

    const activity = await findActivityById(id);

    if (!activity) {
      return res.status(400).json({ activity_not_found: true });
    }

    const combo = await findSimilarStartDistance(activity);
    res.json({ combo });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

export {
  router as similarWorkoutsRouter,
};
