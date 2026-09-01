// src/middlewares/logger.js
//
// Lightweight structured request logger.
// No external logging dependency is required for the MVP.
//
// Every request gets a requestId. If the client already supplied
// X-Request-ID, we preserve it; otherwise we generate one.
//
// The requestId is also exposed to downstream middleware/controllers
// through req.requestId and returned in the response header.

const crypto = require("crypto");

function generateRequestId() {
  return crypto.randomUUID();
}

function logger(req, res, next) {
  const requestId =
    req.get("X-Request-ID") ||
    generateRequestId();

  req.requestId = requestId;

  res.setHeader("X-Request-ID", requestId);

  const startedAt = process.hrtime.bigint();

  res.on("finish", () => {
    const durationMs =
      Number(process.hrtime.bigint() - startedAt) / 1_000_000;

    const logEntry = {
      timestamp: new Date().toISOString(),
      level: "info",
      type: "http_request",
      requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Math.round(durationMs * 100) / 100,
      userId: req.user?.id || null,
    };

    console.log(JSON.stringify(logEntry));
  });

  next();
}

module.exports = logger;
