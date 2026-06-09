const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const preferenceSchema = new mongoose.Schema(
  {
    _id: { type: String, default: uuidv4 },
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    categories: {
      placement: {
        enabled: { type: Boolean, default: true },
        frequency: {
          type: String,
          enum: ["instant", "daily", "weekly"],
          default: "instant",
        },
      },
      result: {
        enabled: { type: Boolean, default: true },
        frequency: {
          type: String,
          enum: ["instant", "daily", "weekly"],
          default: "instant",
        },
      },
      event: {
        enabled: { type: Boolean, default: true },
        frequency: {
          type: String,
          enum: ["instant", "daily", "weekly"],
          default: "instant",
        },
      },
    },
    channels: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      inApp: { type: Boolean, default: true },
    },
    doNotDisturb: {
      enabled: { type: Boolean, default: false },
      startTime: String, // HH:mm format
      endTime: String, // HH:mm format
    },
    emailDigest: {
      enabled: { type: Boolean, default: false },
      frequency: { type: String, enum: ["daily", "weekly"], default: "daily" },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: "notification_preferences", timestamps: true },
);

preferenceSchema.index({ userId: 1 });

const NotificationPreference = mongoose.model(
  "NotificationPreference",
  preferenceSchema,
);

module.exports = NotificationPreference;
