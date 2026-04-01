const { protect } = require("./authMiddleware");

// Middleware to check if user is admin
// This should be used AFTER protect middleware
const adminOnly = (req, res, next) => {
  // Check if user is authenticated and is admin
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Admin only." });
  }
};

// Combined middleware: protect + adminOnly
const protectAdmin = [protect, adminOnly];

module.exports = { protect, adminOnly, protectAdmin };
