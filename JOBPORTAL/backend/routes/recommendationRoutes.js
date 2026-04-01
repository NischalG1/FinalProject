const express = require("express");
const { getRecommendedJobs } = require("../controllers/recommendationController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// GET /api/jobs/recommendations
router.get("/recommendations", protect, getRecommendedJobs);

module.exports = router;
