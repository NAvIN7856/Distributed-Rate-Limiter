const rules = require("../rules/rules");

function getRule(req) {
  const key = `${req.method}:${req.path}`;
  console.log({
    method: req.method,
    path: req.path,
    route: req.route,
  });
  return rules.routes[key] || rules.default;
}

module.exports = getRule;
