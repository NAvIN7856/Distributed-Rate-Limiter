const express = require("express");
const cors = require("cors");
const rateLimiter = require("./middleware/rateLimiter");
const testRoutes = require("./routes/test.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const responseTime = require("response-time");
const { httpRequestDuration } = require("./metrics/metrics");
const { client } = require("./metrics/metrics");
const app = express();

// CORS for frontend dev and production deployments
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3001",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app")
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  }),
);

app.use(
  responseTime((req, res, time) => {
    httpRequestDuration
      .labels(req.method, req.path, res.statusCode)
      .observe(time / 1000);
  }),
);
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType);

  res.end(await client.register.metrics());
});
app.use(express.json());

// Dashboard routes (before rate limiter so they aren't rate-limited)
app.use("/", dashboardRoutes);

app.use(rateLimiter);
app.use("/", testRoutes);
module.exports = app;
