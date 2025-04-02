const { Router } = require('express');
const { logger } = require('../../utils/logger');

const router = new Router();

router.get('/:functionName', async (req, res) => {
  logger.info({ message: 'RPC endpoint hit' });
  res.status(200).json({ message: 'RPC endpoint hit' });
});

router.post('/:functionName', async (req, res) => {
  logger.info({ message: 'RPC endpoint hit' });
  res.status(200).json({ message: 'RPC endpoint hit' });
});

module.exports = {
  rpcRouter: router,
};