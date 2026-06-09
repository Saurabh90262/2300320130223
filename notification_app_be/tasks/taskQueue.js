const Notification = require("../models/Notification");
const User = require("../models/User");
const { Log } = require("logging-middleware");

class TaskQueue {
  constructor() {
    this.tasks = [];
    this.processing = false;
    this.maxRetries = 3;
    this.backoffMultiplier = 5;
    this.io = null;
    this.redis = null;
  }

  setIo(io) {
    this.io = io;
  }

  setRedis(redis) {
    this.redis = redis;
  }

  async enqueueTask(taskType, payload, retries = 0) {
    const task = {
      id: Date.now() + Math.random(),
      type: taskType,
      payload,
      retries,
      createdAt: new Date(),
      status: "pending",
    };

    this.tasks.push(task);
    Log(
      "backend",
      "info",
      "cron_job",
      `Enqueued task type=${taskType} id=${task.id}`,
    );
    this.processTasks();
    return task.id;
  }

  async processTasks() {
    if (this.processing || this.tasks.length === 0) return;

    this.processing = true;

    while (this.tasks.length > 0) {
      const task = this.tasks.shift();

      try {
        task.status = "processing";

        switch (task.type) {
          case "notify_all":
            await this.notifyAllTask(task.payload);
            break;
          default:
            throw new Error(`Unknown task type: ${task.type}`);
        }

        task.status = "completed";
        Log(
          "backend",
          "info",
          "cron_job",
          `Task ${task.id} completed successfully`,
        );
      } catch (error) {
        task.status = "failed";
        task.error = error.message;
        Log(
          "backend",
          "error",
          "cron_job",
          `Task ${task.id} failed: ${error.message}`,
        );

        if (task.retries < this.maxRetries) {
          const delay = this.backoffMultiplier ** (task.retries + 1) * 1000;
          setTimeout(() => {
            this.enqueueTask(task.type, task.payload, task.retries + 1);
          }, delay);
        } else {
          Log(
            "backend",
            "fatal",
            "cron_job",
            `Task ${task.id} failed after ${this.maxRetries} retries`,
          );
        }
      }
    }

    this.processing = false;
  }

  async notifyAllTask(payload) {
    const {
      userIds,
      type,
      title,
      message,
      metadata,
      batchSize = 100,
    } = payload;

    Log(
      "backend",
      "info",
      "cron_job",
      `Starting bulk notification for ${userIds.length} users`,
    );

    for (let i = 0; i < userIds.length; i += batchSize) {
      const batch = userIds.slice(i, i + batchSize);

      const notifications = batch.map((userId) => ({
        userId,
        type,
        title,
        message,
        metadata,
        read: false,
      }));

      await Notification.insertMany(notifications);

      for (const userId of batch) {
        await User.updateOne({ _id: userId }, { $inc: { unreadCount: 1 } });

        if (this.redis) {
          await this.redis.del(`notifications:${userId}:*`);
          await this.redis.del(`priority:${userId}:*`);
        }

        if (this.io) {
          this.io.to(`user_${userId}`).emit("notification:new", {
            type,
            title,
            message,
            createdAt: new Date(),
          });
        }
      }

      Log(
        "backend",
        "info",
        "cron_job",
        `Processed batch ${Math.floor(i / batchSize) + 1} with ${batch.length} users`,
      );
    }
  }
}

const taskQueue = new TaskQueue();

module.exports = taskQueue;
