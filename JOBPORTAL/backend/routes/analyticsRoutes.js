const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { getEmployerAnalytics, getJobSeekerAnalytics } = require("../controllers/analyticsController");

router.get("/overview", protect, (req, res, next) => {
  if (req.user.role === "employer") {
    return getEmployerAnalytics(req, res, next);
  } else if (req.user.role === "jobseeker") {
    return getJobSeekerAnalytics(req, res, next);
  } else {
    return res.status(403).json({ message: "Access denied" });
  }
});

module.exports = router;