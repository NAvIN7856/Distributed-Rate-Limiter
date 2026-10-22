const express = require("express");
const redis = require("../config/redis");
const rules = require("../rules/rules");
const { client, allowedRequests, blockedRequests } = require("../metrics/metrics");

const router = express.Router();

// Get all rate limit rules
router.get("/api/dashboard/rules", (req, res) => {
  const formattedRules = Object.entries(rules.routes).map(([key, value]) => {
    const [method, path] = key.split(":");
    return {
      id: key,
      method,
      path,
      limit: value.limit,
      window: value.window,
    };
  });

  res.json({
    success: true,
    defaultRule: rules.default,
    rules: formattedRules,
  });
});

// Get current metrics snapshot
router.get("/api/dashboard/metrics", async (req, res) => {
  try {
    const metrics = await client.register.getMetricsAsJSON();

    const allowed = metrics.find((m) => m.name === "rate_limit_allowed_total");
    const blocked = metrics.find((m) => m.name === "rate_limit_blocked_total");
    const duration = metrics.find(
      (m) => m.name === "http_request_duration_seconds",
    );

    const allowedCount = allowed?.values?.[0]?.value || 0;
    const blockedCount = blocked?.values?.[0]?.value || 0;
    const totalCount = allowedCount + blockedCount;

    // Calculate avg response time from histogram
    const durationSum = duration?.values?.find(
      (v) => v.metricName === "http_request_duration_seconds_sum",
    );
    const durationCount = duration?.values?.find(
      (v) => v.metricName === "http_request_duration_seconds_count",
    );
    const avgResponseTime =
      durationSum && durationCount && durationCount.value > 0
        ? ((durationSum.value / durationCount.value) * 1000).toFixed(2)
        : 0;

    // Get per-route breakdown
    const routeBreakdown = [];
    if (duration?.values) {
      const routeMap = new Map();
      for (const v of duration.values) {
        if (v.metricName === "http_request_duration_seconds_count" && v.labels) {
          const key = `${v.labels.method}:${v.labels.route}`;
          if (!routeMap.has(key)) {
            routeMap.set(key, {
              method: v.labels.method,
              route: v.labels.route,
              count: 0,
              statuses: {},
            });
          }
          const entry = routeMap.get(key);
          entry.count += v.value;
          entry.statuses[v.labels.status] =
            (entry.statuses[v.labels.status] || 0) + v.value;
        }
      }
      routeBreakdown.push(...routeMap.values());
    }

    res.json({
      success: true,
      metrics: {
        allowed: allowedCount,
        blocked: blockedCount,
        total: totalCount,
        blockRate:
          totalCount > 0
            ? ((blockedCount / totalCount) * 100).toFixed(1)
            : "0.0",
        avgResponseTime: Number(avgResponseTime),
        routeBreakdown,
      },
    });
  } catch (err) {
    console.error("Metrics error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch metrics" });
  }
});

// Get Redis connection status and key stats
router.get("/api/dashboard/redis", async (req, res) => {
  try {
    const info = await redis.info("server");
    const keyspace = await redis.info("keyspace");
    const dbSize = await redis.dbsize();

    // Get active rate limit keys
    const keys = await redis.keys("ip:*");
    const activeClients = new Set();
    for (const key of keys) {
      const parts = key.split(":");
      // key format: ip:<identity>:METHOD:/path
      if (parts.length >= 2) {
        activeClients.add(parts.slice(0, 3).join(":"));
      }
    }

    res.json({
      success: true,
      redis: {
        status: redis.status,
        totalKeys: dbSize,
        activeRateLimitKeys: keys.length,
        activeClients: activeClients.size,
        keys: keys.slice(0, 50), // limit to 50 keys for display
      },
    });
  } catch (err) {
    console.error("Redis info error:", err);
    res.status(500).json({ success: false, message: "Redis not available" });
  }
});

// Get system architecture info
router.get("/api/dashboard/architecture", (req, res) => {
  res.json({
    success: true,
    architecture: {
      loadBalancer: {
        type: "Nginx",
        algorithm: "Round Robin",
        port: 80,
      },
      backends: [
        { name: "Backend 1", port: 5000, host: "backend1" },
        { name: "Backend 2", port: 5000, host: "backend2" },
        { name: "Backend 3", port: 5000, host: "backend3" },
      ],
      redis: {
        host: process.env.REDIS_HOST || "localhost",
        port: process.env.REDIS_PORT || 6379,
      },
      algorithm: "Sliding Window Log",
      strategies: [
        { name: "User ID", header: "x-user-id", priority: 1 },
        { name: "API Key", header: "x-api-key", priority: 2 },
        { name: "Role", header: "x-role", priority: 3 },
        { name: "IP Address", header: "auto", priority: 4 },
      ],
      monitoring: {
        prometheus: { port: 9090 },
        grafana: { port: 3000 },
      },
    },
  });
});

// Test endpoint - allows frontend to fire test requests
router.post("/api/dashboard/test-request", async (req, res) => {
  const { endpoint, method, headers } = req.body;
  const startTime = Date.now();

  try {
    // We simulate by making an internal request through the rate limiter
    const http = require("http");
    const options = {
      hostname: "localhost",
      port: process.env.PORT || 5000,
      path: endpoint || "/products",
      method: method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    };

    const result = await new Promise((resolve, reject) => {
      const request = http.request(options, (response) => {
        let data = "";
        response.on("data", (chunk) => (data += chunk));
        response.on("end", () => {
          resolve({
            statusCode: response.statusCode,
            body: JSON.parse(data),
            responseTime: Date.now() - startTime,
          });
        });
      });
      request.on("error", reject);
      if (method === "POST") {
        request.write(JSON.stringify({}));
      }
      request.end();
    });

    res.json({ success: true, result });
  } catch (err) {
    res.json({
      success: false,
      result: {
        statusCode: 500,
        body: { message: err.message },
        responseTime: Date.now() - startTime,
      },
    });
  }
});

module.exports = router;
