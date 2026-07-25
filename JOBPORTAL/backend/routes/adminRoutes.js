const express = require("express");
const {
  getAllUsers,
  deleteUser,
  getPendingJobs,
  approveJob,
  rejectJob,
  getAllJobs,
  deleteJob,
  getRecentActivity, // Add this import
} = require("../controllers/adminController");
const { protect, adminOnly } = require("../middlewares/adminMiddleware");

const router = express.Router();

// Test route to verify admin routes are working (remove in production)
router.get("/test", (req, res) => {
  res.json({ message: "Admin routes are working!" });
});

// All routes require admin authentication
router.get("/users", protect, adminOnly, getAllUsers);
router.delete("/users/:id", protect, adminOnly, deleteUser);
router.get("/jobs/pending", protect, adminOnly, getPendingJobs);
router.get("/jobs", protect, adminOnly, getAllJobs);
router.put("/jobs/:id/approve", protect, adminOnly, approveJob);
router.put("/jobs/:id/reject", protect, adminOnly, rejectJob);
router.delete("/jobs/:id", protect, adminOnly, deleteJob);

// New route for recent activity
router.get("/activity", protect, adminOnly, getRecentActivity);

module.exports = router;