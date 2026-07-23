const Redis = require("ioredis");
require("dotenv").config();

const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
});

redis.on("connect", () => {
    console.log("✅ Redis Connected");
});

redis.on("error", (err) => {
    console.error("Redis Error:", err.message);
});

module.exports = redis;