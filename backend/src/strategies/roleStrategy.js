function roleStrategy(req) {
  const role = req.headers["x-role"];

  if (!role) {
    return null;
  }

  return `role:${role}`;
}

module.exports = roleStrategy;
