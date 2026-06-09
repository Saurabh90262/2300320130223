const { Log } = require("logging-middleware");

exports.health = (req, res) => {
  Log("backend", "debug", "domain", "Liveness health check requested");
  res.json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date(),
    uptime: process.uptime(),
  });
};

exports.ready = async (req, res) => {
  const redis = req.app.locals.redis;

  try {
    const db = require("mongoose").connection;
    const mongoStatus = db.readyState === 1 ? "connected" : "disconnected";
    const redisStatus = redis.status === "ready" ? "connected" : "disconnected";

    if (mongoStatus === "connected" && redisStatus === "connected") {
      Log("backend", "info", "domain", "Readiness check passed");
      res.json({
        success: true,
        message: "System is ready",
        services: { mongodb: mongoStatus, redis: redisStatus },
      });
    } else {
      Log(
        "backend",
        "warn",
        "domain",
        `Readiness check failed mongo=${mongoStatus} redis=${redisStatus}`,
      );
      res.status(503).json({
        success: false,
        message: "System not ready",
        services: { mongodb: mongoStatus, redis: redisStatus },
      });
    }
  } catch (error) {
    Log("backend", "error", "domain", `Readiness check error: ${error.message}`);
    res.status(503).json({ success: false, message: error.message });
  }
};
