const userStrategy = require("../strategies/userStrategy");
const apiKeyStrategy = require("../strategies/apiKeyStrategy");
const roleStrategy = require("../strategies/roleStrategy");
const ipStrategy = require("../strategies/ipStrategy");

function generateKey(req) {
  return (
    userStrategy(req) ||
    apiKeyStrategy(req) ||
    roleStrategy(req) ||
    ipStrategy(req)
  );
}

module.exports = generateKey;
