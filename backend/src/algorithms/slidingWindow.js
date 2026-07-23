const redis = require("../config/redis");

const WINDOW = 60; // seconds
const LIMIT = 5;

async function slidingWindow(key) {
  const now = Date.now();
  const windowStart = now - WINDOW * 1000;

  // Remove expired requests
  await redis.zremrangebyscore(key, 0, windowStart);

  // Count remaining requests
  const count = await redis.zcard(key);

  if (count >= LIMIT) {
    return false;
  }

  // Add current request
  await redis.zadd(key, now, `${now}-${Math.random()}`);

  // Keep Redis clean
  await redis.expire(key, WINDOW);

  return true;
}

module.exports = slidingWindow;
