const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { Log } = require("logging-middleware");
const mongoose = require("mongoose");
const { createServer } = require("http");
const { Server } = require("socket.io");
require("express-async-errors");

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: process.env.FRONTEND_URL || "http://localhost:3000" },
});

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/notifications", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB Connected");
    Log("backend", "info", "db", "MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("❌ MongoDB Error:", err);
    Log("backend", "error", "db", `MongoDB connection failed: ${err.message}`);
  });

// Redis Connection (for caching)
const Redis = require("ioredis");
const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
});

redis.on("connect", () => {
  console.log("✅ Redis Connected");
  Log("backend", "info", "cache", "Redis connected successfully");
});
redis.on("error", (err) => {
  console.error("❌ Redis Error:", err);
  Log("backend", "error", "cache", `Redis connection error: ${err.message}`);
});

// Store Redis in app for middleware access
app.locals.redis = redis;
app.locals.io = io;

const taskQueue = require("./tasks/taskQueue");
taskQueue.setIo(io);
taskQueue.setRedis(redis);

// Routes
const notificationRoutes = require("./routes/notificationRoutes");
const userRoutes = require("./routes/userRoutes");
const healthRoutes = require("./routes/healthRoutes");

app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/health", healthRoutes);

// WebSocket Events
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("join_user", (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined room`);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err);
  Log(
    "backend",
    "error",
    "controller",
    `Unhandled error on ${req.method} ${req.originalUrl}: ${err.message}`,
  );
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err : {},
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket ready at ws://localhost:${PORT}`);
  Log("backend", "info", "domain", `Server started on port ${PORT}`);
});

module.exports = { app, io, redis };
