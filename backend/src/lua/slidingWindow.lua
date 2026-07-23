local key = KEYS[1]

local now = tonumber(ARGV[1])

local window = tonumber(ARGV[2])

local limit = tonumber(ARGV[3])

-- Remove old requests
redis.call("ZREMRANGEBYSCORE", key, 0, now - window)

-- Count current requests
local count = redis.call("ZCARD", key)

if count >= limit then
    return 0
end

-- Add current request
redis.call("ZADD", key, now, now)

-- Set expiration
redis.call("EXPIRE", key, math.ceil(window / 1000))

return 1