const express = require("express");
const rateLimiter = require("./middleware/rateLimiter");
const testRoutes = require("./routes/test.routes");
const responseTime = require("response-time");
const { httpRequestDuration } = require("./metrics/metrics");
const { client } = require("./metrics/metrics");
const app = express();
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
app.use(rateLimiter);
app.use("/", testRoutes);
module.exports = app;
