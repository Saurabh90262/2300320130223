const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const notificationSchema = new mongoose.Schema(
  {
    _id: { type: String, default: uuidv4 },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["placement", "result", "event"],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: Date,
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
      // Auto-delete after 90 days
      expires: 7776000,
    },
    category: {
      type: String,
      enum: ["urgent", "important", "normal"],
      default: "normal",
    },
    actionUrl: String,
    archived: {
      type: Boolean,
      default: false,
    },
  },
  {
    collection: "notifications",
    timestamps: true,
  },
);

// Composite Indexes for Query Optimization
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ userId: 1, type: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, archived: 1, createdAt: -1 });

// Virtual field for priority score
notificationSchema.virtual("priorityScore").get(function () {
  const typeWeights = { placement: 100, result: 80, event: 60 };
  const typeScore = typeWeights[this.type] || 0;

  const daysSince = (Date.now() - this.createdAt) / (1000 * 60 * 60 * 24);
  const recencyScore = 100 / (1 + daysSince);

  const engagementScore = this.read ? 0 : 100;

  return typeScore * 0.5 + recencyScore * 0.3 + engagementScore * 0.2;
});

notificationSchema.set("toJSON", { virtuals: true });

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
