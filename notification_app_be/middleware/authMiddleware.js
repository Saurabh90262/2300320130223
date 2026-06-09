const jwt = require("jwt-simple");
const { Log } = require("logging-middleware");

const SECRET_KEY =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

exports.authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      Log("backend", "warn", "domain", "Auth rejected: missing token");
      return res
        .status(401)
        .json({ success: false, message: "No token provided" });
    }

    const decoded = jwt.decode(token, SECRET_KEY);
    req.userId = decoded.userId;
    Log("backend", "debug", "domain", `Auth succeeded for user ${decoded.userId}`);
    next();
  } catch (error) {
    Log("backend", "warn", "domain", "Auth rejected: invalid token");
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};

exports.adminMiddleware = (req, res, next) => {
  // This would check user role from database
  // For now, just verify auth
  exports.authMiddleware(req, res, () => {
    // In production, fetch user and check role
    next();
  });
};
