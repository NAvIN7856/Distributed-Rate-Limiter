const redis = require("../config/redis");
const { getSha } = require("./luaLoader");
async function allowRequest(key, limit, window) {
  const result = await redis.evalsha(
    getSha(),
    1,
    key,
    Date.now(),
    window * 1000,
    limit,
  );

  return result === 1;
}

module.exports = allowRequest;
