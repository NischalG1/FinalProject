const express = require("express");
const {
  updateProfile,
  deleteResume,
  getPublicProfile,
} = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

const router = express.Router();

// Protected routes (Login bhayeko user le matra thichna paune)
router.put("/profile", protect, updateProfile);
router.post("/resume", protect, deleteResume);

// Resume upload endpoint
router.post("/upload-resume", protect, upload.single("resume"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    const resumeUrl = `${req.protocol}://${req.get("host")}/uploads/${
      req.file.filename
    }`;
    
    // Update user profile with resume URL
    const User = require("../models/User");
    const user = await User.findById(req.user._id);
    if (user) {
      user.resume = resumeUrl;
      await user.save();
    }
    
    res.status(200).json({ resumeUrl });
  } catch (error) {
    res.status(500).json({ message: "Failed to save resume", error: error.message });
  }
});

// Public route (Jun pani user le herna paune)
router.get("/:id", getPublicProfile);

module.exports = router;
