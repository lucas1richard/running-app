const { Router } = require('express');
const { deleteActivity } = require('../../../controllers/deleteActivity');

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

module.exports = {
  deleteRouter: router,
};
