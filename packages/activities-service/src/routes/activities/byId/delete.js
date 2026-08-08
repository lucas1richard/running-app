import { Router } from 'express';
import { deleteActivity } from '../../../controllers/deleteActivity.js';

const router = Router();

router.delete('/:id', async (req, res) => {
  try {
    const activityId = req.params?.id;
    await deleteActivity(activityId);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

export {
  router as deleteRouter,
};
