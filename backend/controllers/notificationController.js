const Notification = require("../models/Notification");
const User = require("../models/User");
const NotificationPreference = require("../models/NotificationPreference");
const { v4: uuidv4 } = require("uuid");

// GET all notifications for a user with pagination
exports.getNotifications = async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 20, read, type } = req.query;
  const redis = req.app.locals.redis;

  try {
    // Try cache first
    const cacheKey = `notifications:${userId}:${page}:${read}:${type}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        data: JSON.parse(cached),
        source: "cache",
      });
    }

    let query = { userId, archived: false };
    if (read !== undefined) query.read = read === "true";
    if (type) query.type = type;

    const notifications = await Notification.find(query)
      .select(
        "_id userId type title message read readAt createdAt category actionUrl",
      )
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Notification.countDocuments(query);

    const result = {
      notifications,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      },
    };

    // Cache for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(result));

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET top priority notifications (Stage 6 algorithm)
exports.getTopPriorityNotifications = async (req, res) => {
  const { userId } = req.params;
  const { limit = 10 } = req.query;
  const redis = req.app.locals.redis;

  try {
    const cacheKey = `priority:${userId}:${limit}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        data: JSON.parse(cached),
        source: "cache",
      });
    }

    const notifications = await Notification.find({ userId, archived: false })
      .select("-__v")
      .lean();

    // Calculate priority scores
    const prioritized = notifications.map((n) => {
      const typeWeights = { placement: 100, result: 80, event: 60 };
      const typeScore = typeWeights[n.type] || 0;

      const daysSince =
        (Date.now() - new Date(n.createdAt)) / (1000 * 60 * 60 * 24);
      const recencyScore = 100 / (1 + daysSince);

      const engagementScore = n.read ? 0 : 100;

      const priorityScore =
        typeScore * 0.5 + recencyScore * 0.3 + engagementScore * 0.2;

      return { ...n, priorityScore };
    });

    const topPriority = prioritized
      .sort((a, b) => b.priorityScore - a.priorityScore)
      .slice(0, limit);

    await redis.setex(cacheKey, 60, JSON.stringify(topPriority));

    res.json({ success: true, data: topPriority });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET single notification
exports.getNotification = async (req, res) => {
  const { id } = req.params;

  try {
    const notification = await Notification.findById(id);

    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }

    res.json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST create notification
exports.createNotification = async (req, res) => {
  const { userId, type, title, message, metadata, category, actionUrl } =
    req.body;
  const redis = req.app.locals.redis;
  const io = req.app.locals.io;

  try {
    const notification = new Notification({
      _id: uuidv4(),
      userId,
      type,
      title,
      message,
      metadata,
      category,
      actionUrl,
      read: false,
    });

    await notification.save();

    // Invalidate cache
    await redis.del(`notifications:${userId}:*`);
    await redis.del(`priority:${userId}:*`);

    // Emit real-time event via WebSocket
    io.to(`user_${userId}`).emit("notification:new", {
      _id: notification._id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      createdAt: notification.createdAt,
    });

    // Increment unread count
    await User.updateOne({ _id: userId }, { $inc: { unreadCount: 1 } });

    res.status(201).json({ success: true, data: notification });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// PATCH mark as read
exports.markAsRead = async (req, res) => {
  const { id } = req.params;
  const redis = req.app.locals.redis;

  try {
    const notification = await Notification.findByIdAndUpdate(
      id,
      { read: true, readAt: new Date() },
      { new: true },
    );

    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }

    // Invalidate cache
    await redis.del(`notifications:${notification.userId}:*`);
    await redis.del(`priority:${notification.userId}:*`);

    // Decrement unread count
    await User.updateOne(
      { _id: notification.userId },
      { $inc: { unreadCount: -1 } },
    );

    res.json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE notification
exports.deleteNotification = async (req, res) => {
  const { id } = req.params;
  const redis = req.app.locals.redis;

  try {
    const notification = await Notification.findByIdAndDelete(id);

    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }

    // Invalidate cache
    await redis.del(`notifications:${notification.userId}:*`);

    res.json({ success: true, message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST bulk create notifications (Stage 5)
exports.bulkCreateNotifications = async (req, res) => {
  const { userIds, type, title, message, metadata } = req.body;
  const redis = req.app.locals.redis;
  const io = req.app.locals.io;

  try {
    const notifications = userIds.map((userId) => ({
      _id: uuidv4(),
      userId,
      type,
      title,
      message,
      metadata,
      read: false,
    }));

    await Notification.insertMany(notifications, { ordered: false });

    // Invalidate caches for all users
    for (const userId of userIds) {
      await redis.del(`notifications:${userId}:*`);
      await redis.del(`priority:${userId}:*`);

      // Emit real-time event
      io.to(`user_${userId}`).emit("notification:new", {
        type,
        title,
        message,
        createdAt: new Date(),
      });

      // Increment unread count
      await User.updateOne({ _id: userId }, { $inc: { unreadCount: 1 } });
    }

    res.status(201).json({
      success: true,
      data: {
        created: notifications.length,
        message: `Successfully sent to ${notifications.length} users`,
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// GET notification preferences
exports.getPreferences = async (req, res) => {
  const { userId } = req.params;

  try {
    let preferences = await NotificationPreference.findOne({ userId });

    if (!preferences) {
      preferences = new NotificationPreference({ userId, _id: uuidv4() });
      await preferences.save();
    }

    res.json({ success: true, data: preferences });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH update preferences
exports.updatePreferences = async (req, res) => {
  const { userId } = req.params;
  const updates = req.body;

  try {
    let preferences = await NotificationPreference.findOne({ userId });

    if (!preferences) {
      preferences = new NotificationPreference({
        userId,
        _id: uuidv4(),
        ...updates,
      });
    } else {
      Object.assign(preferences, updates);
    }

    await preferences.save();

    res.json({ success: true, data: preferences });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET unread count
exports.getUnreadCount = async (req, res) => {
  const { userId } = req.params;

  try {
    const count = await Notification.countDocuments({
      userId,
      read: false,
      archived: false,
    });
    res.json({ success: true, data: { unreadCount: count } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
