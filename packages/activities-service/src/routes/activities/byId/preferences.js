import { Router } from 'express';
import {
  getActivityPreferences,
  updateActivityPreferences,
} from '../../../persistence/setupdb-couchbase.js';

const router = new Router();

router.get('/:id/preferences', async (req, res) => {
  try {
    const activityId = req.params?.id;
    const preferences = await getActivityPreferences(activityId) || {};
    res.json(preferences);
  } catch (err) {
    res.status(500).send(err.message)
  }
});

router.put('/:id/preferences', async (req, res) => {
  try {
    const activityId = req.params?.id;
    const preferences = req.body;
    await updateActivityPreferences(activityId, preferences);
    res.json(preferences);
  } catch (err) {
    res.status(500).send(err.message)
  }
});

export {
  router as preferencesRouter,
};
