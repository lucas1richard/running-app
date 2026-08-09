import { Router } from 'express';
import {
  getAllHeartRateZones,
  addHeartRateZone,
  createHeartZonesCacheOnce,
} from '../persistence/heartzones/index.ts';

const router = Router();

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
    await createHeartZonesCacheOnce(id, zonesId, times);
    res.sendStatus(201);
  } catch (err) {
    res.sendStatus(500);
  }
});

export {
  router as heartzonesRouter,
};
