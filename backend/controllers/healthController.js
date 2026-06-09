// Health check endpoint
exports.health = (req, res) => {
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
    // Check MongoDB
    const db = require("mongoose").connection;
    const mongoStatus = db.readyState === 1 ? "connected" : "disconnected";

    // Check Redis
    const redisStatus = redis.status === "ready" ? "connected" : "disconnected";

    if (mongoStatus === "connected" && redisStatus === "connected") {
      res.json({
        success: true,
        message: "System is ready",
        services: {
          mongodb: mongoStatus,
          redis: redisStatus,
        },
      });
    } else {
      res.status(503).json({
        success: false,
        message: "System not ready",
        services: {
          mongodb: mongoStatus,
          redis: redisStatus,
        },
      });
    }
  } catch (error) {
    res.status(503).json({
      success: false,
      message: error.message,
    });
  }
};
