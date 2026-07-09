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
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// IMPORTANT: Specific routes must come BEFORE dynamic routes
// Employer jobs route - specific path
router.route("/get-jobs-employer").get(protect, getJobsEmployer);

// Public routes
router.route("/").get(getJobs);
router.route("/:id").get(getJobById);

// Protected employer routes
router.route("/").post(protect, createJob);
router.route("/:id").put(protect, updateJob).delete(protect, deleteJob);
router.put("/:id/toggle-close", protect, toggleCloseJob);

module.exports = router;