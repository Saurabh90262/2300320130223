// Celery-like task queue for Node.js
// In production, use Bull Queue or Celery via Python

const Notification = require("../models/Notification");
const User = require("../models/User");

class TaskQueue {
  constructor() {
    this.tasks = [];
    this.processing = false;
    this.maxRetries = 3;
    this.backoffMultiplier = 5; // exponential backoff: 5s, 25s, 125s
  }

  // Add task to queue
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
    this.processTasks();
    return task.id;
  }

  // Process queued tasks
  async processTasks() {
    if (this.processing || this.tasks.length === 0) return;

    this.processing = true;

    while (this.tasks.length > 0) {
      const task = this.tasks.shift();

      try {
        task.status = "processing";

        switch (task.type) {
          case "send_email":
            await this.sendEmailTask(task.payload);
            break;
          case "save_to_db":
            await this.saveToDbTask(task.payload);
            break;
          case "push_to_app":
            await this.pushToAppTask(task.payload);
            break;
          case "notify_all":
            await this.notifyAllTask(task.payload);
            break;
        }

        task.status = "completed";
        console.log(`✅ Task ${task.id} completed`);
      } catch (error) {
        task.status = "failed";
        task.error = error.message;

        if (task.retries < this.maxRetries) {
          const delay = this.backoffMultiplier ** (task.retries + 1) * 1000; // exponential backoff
          console.log(
            `⏰ Retrying task ${task.id} in ${delay}ms (attempt ${task.retries + 1})`,
          );

          setTimeout(() => {
            this.enqueueTask(task.type, task.payload, task.retries + 1);
          }, delay);
        } else {
          console.error(
            `❌ Task ${task.id} failed after ${this.maxRetries} retries: ${error.message}`,
          );
        }
      }
    }

    this.processing = false;
  }

  // Task: Send email
  async sendEmailTask(payload) {
    const { to, subject, message } = payload;
    // In production, integrate with email service (SendGrid, AWS SES, etc.)
    console.log(`📧 Sending email to ${to}: ${subject}`);
    // Simulate email sending
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  // Task: Save to database
  async saveToDbTask(payload) {
    const { userId, type, title, message, metadata } = payload;
    const notification = new Notification({
      userId,
      type,
      title,
      message,
      metadata,
      read: false,
    });
    await notification.save();
    console.log(`💾 Saved notification for user ${userId}`);
  }

  // Task: Push notification to app
  async pushToAppTask(payload) {
    const { userId, notification } = payload;
    // In production, integrate with push service (Firebase Cloud Messaging, APNs, etc.)
    console.log(`🔔 Pushing notification to app for user ${userId}`);
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  // Task: Notify all users in batches
  async notifyAllTask(payload) {
    const {
      userIds,
      type,
      title,
      message,
      metadata,
      batchSize = 100,
    } = payload;
    console.log(`📢 Starting bulk notification to ${userIds.length} users`);

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
      console.log(
        `✅ Batch ${Math.ceil(i / batchSize) + 1}: Created ${batch.length} notifications`,
      );

      // Update unread counts
      for (const userId of batch) {
        await User.updateOne({ _id: userId }, { $inc: { unreadCount: 1 } });
      }
    }

    console.log(`🎉 Bulk notification completed for ${userIds.length} users`);
  }
}

// Singleton instance
const taskQueue = new TaskQueue();

module.exports = taskQueue;
