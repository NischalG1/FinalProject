// backend/routes/jobRoutes.js
const express = require("express");
const {
    createJob,
    getJobs,
    getJobById,
    updateJob,
    deleteJob,
    toggleCloseJob,
    getJobsEmployer,
} = require("../controllers/jobController");
const {
    getSimilarJobs,
    getCollaborativeRecommendations,
    clearRecommendationCache
} = require("../controllers/recommendationController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// Public routes
router.route("/").get(getJobs);
router.route("/:id").get(getJobById);

// Job similarity route - MUST be before the :id route that uses same parameter
router.get("/:jobId/similar", getSimilarJobs);

// Protected employer routes
router.route("/").post(protect, createJob);
router.route("/get-jobs-employer").get(protect, getJobsEmployer);
router.route("/:id").put(protect, updateJob).delete(protect, deleteJob);
router.put("/:id/toggle-close", protect, toggleCloseJob);

// Collaborative recommendations (for jobseekers)
router.get("/collaborative/recommendations", protect, getCollaborativeRecommendations);

// Cache management
router.post("/recommendations/clear-cache", protect, clearRecommendationCache);

module.exports = router;