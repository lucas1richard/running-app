const { Router } = require('express');
const {
  getUserPreferences,
  updateUserPreferences,
} = require('../database/setupdb-couchbase');

const router = new Router();

router.get('/preferences', async (req, res) => {
  try {
    const preferences = await getUserPreferences(1);
    res.json(preferences);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post('/preferences', async (req, res) => {
  try {
    const preferences = req.body;
    const rows = await updateUserPreferences(1, preferences);
    res.json(rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = {
  userRouter: router,
};
