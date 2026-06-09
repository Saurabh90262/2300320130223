const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const { authMiddleware } = require("../middleware/authMiddleware");
const { validateNotification } = require("../middleware/validation");

// GET all notifications
router.get("/:userId", authMiddleware, notificationController.getNotifications);

// GET single notification
router.get(
  "/:userId/detail/:id",
  authMiddleware,
  notificationController.getNotification,
);

// GET top priority notifications
router.get(
  "/:userId/priority/top",
  authMiddleware,
  notificationController.getTopPriorityNotifications,
);

// GET unread count
router.get(
  "/:userId/unread/count",
  authMiddleware,
  notificationController.getUnreadCount,
);

// POST create notification
router.post(
  "/",
  authMiddleware,
  validateNotification,
  notificationController.createNotification,
);

// POST bulk create notifications
router.post(
  "/bulk/send",
  authMiddleware,
  notificationController.bulkCreateNotifications,
);

// PATCH mark as read
router.patch("/:id/read", authMiddleware, notificationController.markAsRead);

// DELETE notification
router.delete(
  "/:id",
  authMiddleware,
  notificationController.deleteNotification,
);

// Preferences
router.get(
  "/:userId/preferences",
  authMiddleware,
  notificationController.getPreferences,
);
router.patch(
  "/:userId/preferences",
  authMiddleware,
  notificationController.updatePreferences,
);

module.exports = router;
