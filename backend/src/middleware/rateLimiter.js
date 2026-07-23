const getRule = require("../services/ruleEngine");
const allowRequest = require("../services/slidingWindow.service");
const generateKey = require("../strategies/keyGenerator");
const { allowedRequests, blockedRequests } = require("../metrics/metrics");
module.exports = async (req, res, next) => {
  try {
    const rule = getRule(req);
    const identity = generateKey(req);

    const key = `ip:${identity}:${req.method}:${req.path}`;

    const allowed = await allowRequest(key, rule.limit, rule.window);
    if (!allowed) {
      blockedRequests.inc();
      return res.status(429).json({
        success: false,
        message: "Too Many Requests",
      });
    }
    allowedRequests.inc();
    next();
  } catch (err) {
    console.log(err);
    next();
  }
};
