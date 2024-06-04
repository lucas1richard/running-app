const { Router } = require('express');
const { fetchStrava } = require('../../../utils/fetchStrava');
const Activity = require('../../../database/sequelize-activities');
const { updateActivityDetail } = require('../../../database/setupdb-couchbase');

const router = new Router();

router.put('/:id', async (req, res, next) => {
  try {
    const id = req.params?.id;
    const body = req.body;
    if (!body) return res.status(400).send('request body is required');

    const stravaRes = await fetchStrava(`/activities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(req.body),
    });

    await Activity.update({ ...req.body }, { where: { id } });
    if (body.description) {
      await updateActivityDetail(id, { description: body.description });
    }

    res.json(stravaRes);
  } catch (err) {
    next(err);
  }
});

module.exports = {
  stravaRouter: router,
};
