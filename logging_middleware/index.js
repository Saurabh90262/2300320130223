const { randomUUID } = require("crypto");

function createLoggingMiddleware(options = {}) {
  const {
    logger = console,
    logLevel = "info",
    includeBody = false,
    skipPaths = [],
  } = options;

  return function loggingMiddleware(req, res, next) {
    if (skipPaths.some((path) => req.originalUrl.startsWith(path))) {
      return next();
    }

    const requestId = req.headers["x-request-id"] || randomUUID();
    req.requestId = requestId;
    res.setHeader("X-Request-ID", requestId);

    const start = Date.now();

    res.on("finish", () => {
      const entry = {
        level: logLevel,
        requestId,
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        durationMs: Date.now() - start,
        ip: req.ip,
        userAgent: req.get("user-agent"),
      };

      if (includeBody && req.body && Object.keys(req.body).length > 0) {
        entry.body = req.body;
      }

      logger.info(entry);
    });

    next();
  };
}

module.exports = createLoggingMiddleware;
