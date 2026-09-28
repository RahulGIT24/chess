import redis from "../redis/RedisService";

// This file is the entrypoint forked as its own child process from index.ts:
//   fork(path.resolve(__dirname, "./worker/scheduler.js"))
// `redis.brpop` blocks THIS process, not the one serving HTTP/WS traffic, so slow or
// CPU-bound work here never stalls request handling. Producers elsewhere in the app just
// push a job payload onto the same queue key and return immediately.

const QUEUE_KEY = "background-jobs";

export const runScheduler = async () => {
  while (true) {
    const result = await redis.brpop(QUEUE_KEY, 0);
    if (!result) continue;

    try {
      const job = JSON.parse(result[1]);
      // await doTheActualSlowWork(job);
    } catch (error) {
      console.error("Failed to process job", error);
    }
  }
};

runScheduler();
