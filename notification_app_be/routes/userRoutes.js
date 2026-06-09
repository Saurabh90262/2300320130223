const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authMiddleware } = require("../middleware/authMiddleware");

// POST register
router.post("/register", userController.register);

// POST login
router.post("/login", userController.login);

// GET profile
router.get("/:userId/profile", authMiddleware, userController.getProfile);

// PATCH update profile
router.patch("/:userId/profile", authMiddleware, userController.updateProfile);

module.exports = router;
