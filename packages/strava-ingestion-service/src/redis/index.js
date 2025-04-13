const { createClient } = require('redis');
const waitPort = require('wait-port');

/**
 * @type {import('redis').RedisClientType}
 */
let client;

const getRedisClient = async () => {
  if (client) return client;

  await waitPort({ host: 'redis', port: 6379 });

  client = await createClient({ url: 'redis://redis:6379' })
    .on('error', err => console.trace('Redis Client Error', err))
    .connect();

  return client;
};

let spoofClient;

const getSpoofClient = async () => {
  if (spoofClient) return spoofClient;

  spoofClient = {
    store: {
      test: 'Redis is working!',
      stravaFixedWindow: {
        count: '3',
        loanedFromNextWindow: '0',
      },
      stravaTokenBucket: {
        tokens: '4',
        capacity: '10',
      }
    },
    get: async (key) => {
      await new Promise(resolve => setTimeout(resolve, 1));
      return typeof spoofClient.store[key] === 'undefined' ? null : spoofClient.store[key];
    },
    set: async (key, value) => {
      await new Promise(resolve => setTimeout(resolve, 1));
      return spoofClient.store[key] = value;
    },
    hSet: async (key, field, value) => {
      await new Promise(resolve => setTimeout(resolve, 1));
      if (!spoofClient.store[key]) {
        spoofClient.store[key] = {};
      }
      return spoofClient.store[key][field] = value;
    },
    hGetAll: async (key) => {
      await new Promise(resolve => setTimeout(resolve, 1));
      return typeof spoofClient.store[key] === 'undefined' ? null : spoofClient.store[key];
    }
  };


  return spoofClient;
};

module.exports = {
  getRedisClient,
  getSpoofClient,
};
