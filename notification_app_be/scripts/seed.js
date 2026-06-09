require("dotenv").config();
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const User = require("../models/User");
const Notification = require("../models/Notification");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/notifications";

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  await User.deleteMany({ email: "demo@college.edu" });
  await Notification.deleteMany({});

  const userId = uuidv4();
  const user = new User({
    _id: userId,
    email: "demo@college.edu",
    name: "Demo Student",
    password: "demo1234",
    role: "student",
  });
  await user.save();

  const samples = [
    {
      type: "placement",
      title: "Campus Drive Scheduled",
      message: "Infosys placement drive on June 15. Register by June 10.",
      category: "urgent",
    },
    {
      type: "result",
      title: "Semester Results Published",
      message: "Your semester 6 results are now available on the portal.",
      category: "important",
    },
    {
      type: "event",
      title: "Tech Fest Registration",
      message: "Annual tech fest registrations are open until Friday.",
      category: "normal",
    },
  ];

  for (const sample of samples) {
    await Notification.create({
      userId,
      ...sample,
      read: false,
    });
  }

  await User.updateOne({ _id: userId }, { unreadCount: samples.length });

  console.log("Seed complete");
  console.log("Login: demo@college.edu / demo1234");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
