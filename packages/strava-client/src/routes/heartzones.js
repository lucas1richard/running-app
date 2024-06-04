const { Router } = require('express');
const {
  getAllHeartRateZones,
  addHeartRateZone,
} = require('../database/mysql-heart-zones');
const ZonesCache = require('../database/sequelize-zones-cache');

const router = new Router();

router.get('/', async (req, res) => {
  try {
    const zones = await getAllHeartRateZones() || [];
    res.json(zones);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post('/', async (req, res) => {
  try {
    const { z1, z2, z3, z4, z5, starting } = req.body;
    const rows = await addHeartRateZone({ z1, z2, z3, z4, z5, starting });
    res.json(rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post('/set-cache', async (req, res) => {
  try {
    const { id, times, zonesId } = req.body;
    await ZonesCache.findOrCreate({
      where: {
        seconds_z1: times[0],
        seconds_z2: times[1],
        seconds_z3: times[2],
        seconds_z4: times[3],
        seconds_z5: times[4],
        activityId: id,
        heartZoneId: zonesId,
      },
    });
    res.sendStatus(201)
  } catch (err) {
    res.sendStatus(500);
  }
});

module.exports = {
  heartzonesRouter: router,
};
