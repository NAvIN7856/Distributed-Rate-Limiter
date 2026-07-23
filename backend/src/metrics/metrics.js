const client = require("prom-client");

// Collect default Node.js metrics
client.collectDefaultMetrics();

const allowedRequests = new client.Counter({
    name: "rate_limit_allowed_total",
    help: "Total allowed requests",
});

const blockedRequests = new client.Counter({
    name: "rate_limit_blocked_total",
    help: "Total blocked requests",
});

const httpRequestDuration = new client.Histogram({
    name: "http_request_duration_seconds",
    help: "HTTP request duration",
    labelNames: ["method", "route", "status"],
    buckets: [0.05, 0.1, 0.3, 0.5, 1, 2, 5],
});

module.exports = {
    client,
    allowedRequests,
    blockedRequests,
    httpRequestDuration,
};