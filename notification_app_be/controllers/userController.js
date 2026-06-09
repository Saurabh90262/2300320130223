const User = require("../models/User");
const jwt = require("jwt-simple");
const { v4: uuidv4 } = require("uuid");
const { Log } = require("logging-middleware");

const SECRET_KEY =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

// POST register
exports.register = async (req, res) => {
  const { email, name, password, role } = req.body;

  try {
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const user = new User({
      _id: uuidv4(),
      email,
      name,
      password,
      role: role || "student",
    });

    await user.save();

    Log("backend", "info", "controller", `New user registered: ${email}`);

    const token = jwt.encode(
      { userId: user._id, email: user.email },
      SECRET_KEY,
    );

    res.status(201).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// POST login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    Log("backend", "info", "controller", `User logged in: ${email}`);

    const token = jwt.encode(
      { userId: user._id, email: user.email },
      SECRET_KEY,
    );

    res.json({
      success: true,
      data: {
        user: {
          _id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          unreadCount: user.unreadCount,
        },
        token,
      },
    });
  } catch (error) {
    Log("backend", "error", "controller", `Login failed: ${error.message}`);
    res.status(400).json({ success: false, message: error.message });
  }
};

// GET user profile
exports.getProfile = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH update profile
exports.updateProfile = async (req, res) => {
  const { userId } = req.params;
  const { name, preferences } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { name, preferences },
      { new: true },
    ).select("-password");

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
