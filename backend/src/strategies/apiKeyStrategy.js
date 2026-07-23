function apiKeyStrategy(req) {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey) {
    return null;
  }

  return `apikey:${apiKey}`;
}

module.exports = apiKeyStrategy;
