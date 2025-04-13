const EventEmitter = require('node:events');
const { getRedisClient } = require('./redis');

// states for the bucket:

// 1. there are tokens available in the tokenLimit, and the bucket is at capacity
// expected behavior: the bucket will not continue to refill, and no tokens will be taken from the tokenLimit

// 2. there are tokens available in the tokenLimit, and the bucket is below capacity
// expected behavior: the bucket will refill based on the refillRate, and tokens will be deducted from the tokenLimit

// 3. there are no tokens available in the tokenLimit, and the bucket is at capacity
// expected behavior: the bucket will not refill

// 4. there are no tokens available in the tokenLimit, and the bucket is below capacity
// expected behavior: the bucket will not refill until the tokenLimit has tokens again

class FixedWindowCounter extends EventEmitter {
  constructor({ windowDuration, limit }) {
    super();

    this.windowDuration = windowDuration;
    this.limit = limit;
    this.count = 0;
    this.loanedFromNextWindow = 0;
    this.resetInterval = null;
    this.syncFromRedis().then(() => {
      if (this.limit !== Infinity) this.startResetInterval();
    });
  }

  async syncFromRedis() {
    const redisClient = await getRedisClient();
    const data = await redisClient.hGetAll('stravaFixedWindow');
    if (data) {
      this.count = parseInt(data.count || 0, 10);
      this.loanedFromNextWindow = parseInt(data.loanedFromNextWindow || 0, 10);
    } else {
      this.count = 0;
      this.loanedFromNextWindow = 0;
    }
  }

  async syncToRedis() {
    const redisClient = await getRedisClient();
    await redisClient.hSet('stravaFixedWindow', 'count', this.count);
    await redisClient.hSet('stravaFixedWindow', 'loanedFromNextWindow', this.loanedFromNextWindow);
  }

  async get(key) {
    await new Promise(resolve => setTimeout(resolve, 10));
    return this[key];
  }

  async set(key, value) {
    await new Promise(resolve => setTimeout(resolve, 10));
    this[key] = value;
  }

  get hasTokens() {
    return this.count < this.limit;
  }

  get numTokens() {
    return this.limit - this.count;
  }

  async provideTokens(numTokens = 1) {
    if (this.limit === Infinity) return numTokens;
    if (this.count < this.limit) {
      this.count += numTokens;
      await this.syncToRedis();
      return numTokens;
    }
    this.loanedFromNextWindow += numTokens;
    await this.syncToRedis();
    return numTokens;
  }

  async reset(startCount = 0) {
    const previousCount = this.count;
    if (startCount >= this.limit) {
      console.trace('Resetting count to a value greater than limit');
    }
    const loanedFromNextWindow = this.loanedFromNextWindow;
    this.count = loanedFromNextWindow;
    this.loanedFromNextWindow = Math.max(0, loanedFromNextWindow - this.limit);
    await this.syncToRedis();
    this.emit('reset', { previousCount });
  }

  startResetInterval() {
    if (this.resetInterval) clearInterval(this.resetInterval);
    this.resetInterval = setInterval(async () => {
      await this.reset();
    }, this.windowDuration);
  }
}

class TokenBucket extends EventEmitter {
  constructor({ tokenProvider, capacity, refillRate }) {
    super();

    /** @type {FixedWindowCounter} */
    this.provider = tokenProvider || new FixedWindowCounter({ limit: Infinity });

    this.capacity = capacity;

    this.refillRate = refillRate;

    const emit = this.emit.bind(this);

    this.provider.on('reset', ({ previousCount }) => {
      if (previousCount === 0) emit('refilled', this.tokens);
    });
    this.provider.provideTokens(capacity)
    .then((tokens) => { this.tokens = tokens; })
    .then(() => this.syncFromRedis())
    .then(() => {
      this.refillInterval = setInterval(async () => {
        if (this.tokens < this.capacity) await this._refillToken();
      }, this.refillRate);
    });
  }

  async syncToRedis() {
    const redisClient = await getRedisClient();
    await redisClient.hSet('stravaTokenBucket', 'tokens', this.tokens);
    await redisClient.hSet('stravaTokenBucket', 'capacity', this.capacity);
  }

  async syncFromRedis() {
    const redisClient = await getRedisClient();
    const data = await redisClient.hGetAll('stravaTokenBucket');
    if (data) {
      this.tokens = parseInt(data.tokens || 0, 10);
      this.capacity = parseInt(data.capacity || 10, 10);
    } else {
      this.tokens = this.capacity;
    }
  }

  get hasTokens() {
    return this.tokens > 0;
  }

  async consumeToken() {
    console.log('Attempting to consume token...')
    console.log('this:', this.capacity, this.tokens);
    console.log('provider:', this.provider.limit, this.provider.count);
    if (this.hasTokens && this.provider.hasTokens) {
      this.tokens -= 1;
      await this.syncToRedis();
      return true;
    }
    this.emit('empty');
    return false;
  }

  async _refillToken() {
    const shouldNotify = !this.hasTokens && this.provider.hasTokens;
    if (this.tokens < this.capacity) {
      const providedTokens = await this.provider.provideTokens(1);
      this.tokens += providedTokens;
      await this.syncToRedis();
      if (shouldNotify) this.emit('refilled', this.tokens);
    }
  }
}

const tokenProvider = new FixedWindowCounter({
  windowDuration: 15000,
  limit: 15,
});

const redisRateLimiter = new TokenBucket({
  capacity: 10,
  refillRate: 4000,
  tokenProvider,
});

if (require.main === module) {
  (async () => {
    console.log('Initializing rate limiter...');

    async function* generateConsumer() {
      yield 'initializing';
      while (true) {
        if (redisRateLimiter.hasTokens === false || tokenProvider.hasTokens === false) {
          yield 'none';
          continue;
        }
        const numTotalTokensRemaining = await redisRateLimiter.consumeToken();
        console.log('Token consumed:', numTotalTokensRemaining);
        yield numTotalTokensRemaining || 'none';
      }
    }

    const consumer = await generateConsumer(true);

    async function runConsumer() {
      await new Promise(resolve => setTimeout(resolve, 10));
      await consumer.next();
      // Use setTimeout instead of direct recursion to avoid a memory leak
      setTimeout(runConsumer, 0);
    }

    runConsumer();

    const spoofClient = await getRedisClient();
    setInterval(async () => {
      const store = await spoofClient.hGetAll('stravaFixedWindow');
      const tokenBucket = await spoofClient.hGetAll('stravaTokenBucket');
      console.log('Redis store:', store, 'Token Bucket:', tokenBucket);
    }, 1000);
  }
  )();
}

module.exports = redisRateLimiter;
