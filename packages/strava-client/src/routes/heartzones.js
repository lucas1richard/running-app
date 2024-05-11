const { Router } = require('express');
const { getAllHeartRateZones, addHeartRateZone } = require('../database/mysql-heart-zones');

const router = new Router();

router.get('/', async (req, res) => {
  const zones = await getAllHeartRateZones() || [];
  res.json(zones);
});

router.post('/', async (req, res) => {
  console.log(req.body);
  const { z1, z2, z3, z4, z5, starting } = req.body;
  const rows = await addHeartRateZone({ z1, z2, z3, z4, z5, starting });
  res.json(rows);
});

module.exports = {
  heartzonesRouter: router,
};
