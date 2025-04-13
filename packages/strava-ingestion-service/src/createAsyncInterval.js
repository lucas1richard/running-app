const createAsyncInterval = async (callback) => {
  let keepGoing = true;
  async function* generateConsumer() {
    while (keepGoing) {
      yield await callback();
    }
  }

  const consumer = await generateConsumer();

  async function runInterval(delay = 0) {
    if (!keepGoing) return;
    await new Promise(resolve => setTimeout(resolve, delay));
    await consumer.next();
    // Use setTimeout instead of direct recursion to avoid a memory leak
    setTimeout(() => runInterval(delay), 0);
  }

  function clearInterval() {
    keepGoing = false;
  }

  return [runInterval, clearInterval];
}

if (require.main === module) {
  const demo = async () => {
    console.time('Async Interval Test');
    const [runInterval, clearInterval] = await createAsyncInterval(async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
      console.timeLog('Async Interval Test');
    });

    runInterval(0);

    setTimeout(() => {
      clearInterval();
    }, 10e3);
  }
  demo();
}

module.exports = createAsyncInterval;