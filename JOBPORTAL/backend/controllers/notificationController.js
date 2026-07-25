// backend/controllers/notificationController.js
const Notification = require("../models/Notification");
const User = require("../models/User");

// @desc    Get all notifications for logged-in user
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const { limit = 20, page = 1, read } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = { recipient: req.user._id };
    if (read !== undefined) {
      query.read = read === "true";
    }

    const notifications = await Notification.find(query)
      .populate("sender", "name avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      read: false,
    });

    res.json({
      notifications,
      unreadCount,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

// @desc    Get unread count
// @route   GET /api/notifications/unread-count
// @access  Private
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      read: false,
    });
    res.json({ unreadCount: count });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({ message: "Failed to get unread count" });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.read = true;
    notification.readAt = new Date();
    await notification.save();

    res.json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({ message: "Failed to mark notification as read" });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { read: true, readAt: new Date() }
    );

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Mark all as read error:", error);
    res.status(500).json({ message: "Failed to mark all as read" });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    await notification.deleteOne();
    res.json({ message: "Notification deleted" });
  } catch (error) {
    console.error("Delete notification error:", error);
    res.status(500).json({ message: "Failed to delete notification" });
  }
};

// @desc    Clear all notifications
// @route   DELETE /api/notifications/clear-all
// @access  Private
exports.clearAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ recipient: req.user._id });
    res.json({ message: "All notifications cleared" });
  } catch (error) {
    console.error("Clear all notifications error:", error);
    res.status(500).json({ message: "Failed to clear notifications" });
  }
};

// Helper function to create notification
exports.createNotification = async (notificationData) => {
  try {
    const notification = new Notification(notificationData);
    await notification.save();

    // Populate sender data for immediate use
    if (notificationData.sender) {
      await notification.populate("sender", "name avatar");
    }

    return notification;
  } catch (error) {
    console.error("Create notification error:", error);
    return null;
  }
};

// @desc    Create notification (Admin only)
// @route   POST /api/notifications
// @access  Private/Admin
exports.sendSystemNotification = async (req, res) => {
  try {
    const { recipientId, title, message, type, link, priority } = req.body;

    if (!recipientId || !title || !message) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    const notification = await exports.createNotification({
      recipient: recipientId,
      sender: req.user._id,
      type: type || "system",
      title,
      message,
      link: link || "",
      priority: priority || "medium",
    });

    res.status(201).json(notification);
  } catch (error) {
    console.error("Send notification error:", error);
    res.status(500).json({ message: "Failed to send notification" });
  }
};

// @desc    Send notification to all users (Admin only)
// @route   POST /api/notifications/broadcast
// @access  Private/Admin
exports.broadcastNotification = async (req, res) => {
  try {
    const { title, message, type, link, priority, role } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const query = {};
    if (role) {
      query.role = role;
    }

    const users = await User.find(query).select("_id");
    
    if (users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    const notifications = [];
    for (const user of users) {
      const notification = await exports.createNotification({
        recipient: user._id,
        sender: req.user._id,
        type: type || "admin",
        title,
        message,
        link: link || "",
        priority: priority || "medium",
      });
      if (notification) {
        notifications.push(notification);
      }
    }

    res.status(201).json({
      message: `Notification sent to ${notifications.length} users`,
      count: notifications.length,
    });
  } catch (error) {
    console.error("Broadcast notification error:", error);
    res.status(500).json({ message: "Failed to broadcast notification" });
  }
};