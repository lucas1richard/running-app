const EventEmitter = require('node:events');

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
    if (this.limit !== Infinity)  this.startResetInterval();
  }

  get hasTokens() {
    return this.count < this.limit;
  }

  get numTokens() {
    return this.limit - this.count;
  }

  provideTokens(numTokens = 1) {
    if (this.limit === Infinity) return numTokens;
    if (this.count < this.limit) {
      this.count += numTokens;
      return numTokens;
    }
    this.loanedFromNextWindow += numTokens;
    // console.warn('No tokens available, loaning tokens', console.trace());
    return numTokens;
  }

  reset(startCount = 0) {
    const previousCount = this.count;
    if (startCount >= this.limit) {
      console.trace('Resetting count to a value greater than limit');
    }
    this.count = this.loanedFromNextWindow;
    this.loanedFromNextWindow = Math.max(0, this.loanedFromNextWindow - this.limit);
    this.emit('reset', { previousCount });
  }

  startResetInterval() {
    if (this.resetInterval) clearInterval(this.resetInterval);
    this.resetInterval = setInterval(() => {
      this.reset();
    }, this.windowDuration);
  }
}

class TokenBucket extends EventEmitter {
  constructor({ tokenProvider, capacity, refillRate }) {
    super();

    /** @type {FixedWindowCounter} */
    this.provider = tokenProvider || new FixedWindowCounter({ limit: Infinity });

    this.capacity = capacity;
    this.tokens = this.provider.provideTokens(capacity);
    this.refillRate = refillRate;
    this.debt = 0;

    const emit = this.emit.bind(this);

    this.provider.on('reset', ({ previousCount }) => {
      if (previousCount === 0) emit('refilled', this.tokens);
    });

    this.refillInterval = setInterval(() => {
      if (this.tokens < this.capacity) this._refillToken();
    }, this.refillRate);
  }

  get hasTokens() {
    return this.tokens > 0;
  }

  consumeToken() {
    if (this.hasTokens && this.provider.hasTokens) this.tokens -= 1;
    else this.emit('empty');
    return ([this.tokens, this.provider.numTokens]);
  }

  _refillToken() {
    const shouldNotify = !this.hasTokens && this.provider.hasTokens;
    if (this.tokens < this.capacity) {
      this.tokens += this.provider.provideTokens(1);
      if (shouldNotify) this.emit('refilled', this.tokens);
    }
  }
}

const tokenProvider = new FixedWindowCounter({
  windowDuration: 15000,
  limit: 15,
});

const tokenBucket = new TokenBucket({
  capacity: 10,
  refillRate: 500,
  tokenProvider,
});

if (require.main === module) {
  (async () => {
    console.log('Initializing rate limiter...');

    async function* generateConsumer() {
      while (true) {
        if (tokenBucket.hasTokens === false || tokenProvider.hasTokens === false) {
          yield 'none';
          continue;
        }
        const numTotalTokensRemaining = await tokenBucket.consumeToken();
        console.log('Token consumed:', numTotalTokensRemaining);
        yield numTotalTokensRemaining || 'none';
      }
    }
    const consumer = await generateConsumer(true);

    setInterval(async () => {
      await consumer.next(true);
    }, 10);
  }
  )();
}

module.exports = tokenBucket;
