const { Router } = require('express');
const constants = require('../../constants');

const router = Router();

router.get('/get-contants', async (req, res) => {
  res.json(constants);
});

module.exports = {
  adminRouter: router,
};