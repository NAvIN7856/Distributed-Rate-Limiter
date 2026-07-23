function userStrategy(req) {
  const userId = req.headers["x-user-id"];

  if (!userId) {
    return null;
  }

  return `user:${userId}`;
}

module.exports = userStrategy;
