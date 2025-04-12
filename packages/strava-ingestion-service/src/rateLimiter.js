const EventEmitter = require('node:events');

const CAPACITY = 10;
const REFILL_RATE = 1000; // Milliseconds between token refills

// states for the bucket:

// 1. there are tokens available in the tokenLimit, and the bucket is at capacity
// expected behavior: the bucket will not continue to refill, and no tokens will be taken from the tokenLimit

// 2. there are tokens available in the tokenLimit, and the bucket is below capacity
// expected behavior: the bucket will refill based on the refillRate, and tokens will be deducted from the tokenLimit

// 3. there are no tokens available in the tokenLimit, and the bucket is at capacity
// expected behavior: the bucket will not refill

// 4. there are no tokens available in the tokenLimit, and the bucket is below capacity
// expected behavior: the bucket will not refill until the tokenLimit has tokens again

class Bucket extends EventEmitter {
  constructor({ capacity, refillRate, tokenLimit = 1000 }) {
    super();

    this.t = new Date().getMinutes();
    this.capacity = capacity;
    this.tokens = capacity;
    this.tokenLimit = tokenLimit - capacity;
    this.refillInterval = null;
    this.refillRate = refillRate;
    this.resumeRefill();
    this.limitRefreshInterval = setInterval(() => {
      const shouldNotify = this.tokenLimit < 0;
      // const updatedDate = new Date();
      // if (updatedDate.getMinutes() === this.t) return console.log(updatedDate.getSeconds());
      // this.t = updatedDate.getMinutes();

      // we can't reset the capacity without potentially exceeding the refill window
      this.tokenLimit = tokenLimit - this.tokens;
      if (shouldNotify) this.emit('refilled');
    }, 15000);
  }
  pauseRefill() {
    clearInterval(this.refillInterval);
  }
  resumeRefill() {
    if (this.refillInterval) clearInterval(this.refillInterval);
    this.refillInterval = setInterval(() => {
      if (this.tokens < this.capacity) this._refillToken();
    }, this.refillRate);
  }
  _hasTokens() {
    return this.tokens > 0;
  }
  consumeToken() {
    if (this._hasTokens()) this.tokens -= 1;
    else this.emit('empty');
    return ([this.tokens, this.tokenLimit]);
  }
  _refillToken() {
    const shouldNotify = !this._hasTokens() && this.tokenLimit > 0;
    if (this.tokens < this.capacity) {
      this.tokenLimit -= 1;
      this.tokens += 1;
      if (shouldNotify) this.emit('refilled', this.tokens);
    }
  }
}
const bucket = new Bucket({
  capacity: CAPACITY,
  refillRate: REFILL_RATE,
  tokenLimit: 27,
});

if (require.main === module) {
  (async () => {
    async function* generateConsumer(canContinue = true) {
      console.log('Rate limiter initialized. Can continue:', canContinue);
      while (yield) {
        console.log({canContinue});
        const numTotalTokensRemaining = await bucket.consumeToken();
        console.log('Token consumed:', numTotalTokensRemaining);
        yield numTotalTokensRemaining || 'none';
      }
    }
    const consumer = await generateConsumer(true);

    let myinterval = setInterval(async () => {
      await consumer.next(true);
    }, 10);

    console.log('Initializing rate limiter...');
    bucket.on('empty', async () => {
      // await consumer.next(false);
      clearInterval(myinterval);
      console.log('Rate limit bucket is empty, pausing...');
      bucket.once('refilled', async (tokens) => {
        console.log('Rate limit bucket refilled, resuming...', tokens);
        myinterval = setInterval(async () => {
          await consumer.next(true);
        }, 50);
      });
    });
  }
  )();
}
module.exports = bucket;
