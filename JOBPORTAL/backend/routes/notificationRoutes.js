// backend/routes/notificationRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { adminOnly } = require("../middlewares/adminMiddleware");
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  sendSystemNotification,
  broadcastNotification,
} = require("../controllers/notificationController");

// Protected routes for all authenticated users
router.get("/", protect, getNotifications);
router.get("/unread-count", protect, getUnreadCount);
router.put("/:id/read", protect, markAsRead);
router.put("/read-all", protect, markAllAsRead);
router.delete("/:id", protect, deleteNotification);
router.delete("/clear-all", protect, clearAllNotifications);

// Admin only routes
router.post("/", protect, adminOnly, sendSystemNotification);
router.post("/broadcast", protect, adminOnly, broadcastNotification);

module.exports = router;