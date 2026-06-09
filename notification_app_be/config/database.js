require("dotenv").config();

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/notifications",
  REDIS_HOST: process.env.REDIS_HOST || "localhost",
  REDIS_PORT: process.env.REDIS_PORT || 6379,
  JWT_SECRET: process.env.JWT_SECRET || "your-secret-key-change-in-production",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
  CORS_ORIGIN: process.env.CORS_ORIGIN || [
    "http://localhost:3000",
    "http://localhost:3001",
  ],
};
