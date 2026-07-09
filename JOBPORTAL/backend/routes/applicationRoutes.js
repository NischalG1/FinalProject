// backend/routes/applicationRoutes.js
const express = require("express");
const {
    applyToJob,
    getMyApplications,
    getApplicantsForJob,
    getApplicationById,
    updateStatus,
    getApplicantsWithScoring,  // New import
    getTopApplicants,          // New import
} = require("../controllers/applicationController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// Jobseeker routes
router.post("/:jobId", protect, applyToJob);
router.get("/my", protect, getMyApplications);
router.get("/:id", protect, getApplicationById);

// Employer routes
router.get("/job/:jobId", protect, getApplicantsForJob);
router.get("/job/:jobId/scoring", protect, getApplicantsWithScoring);   // New route
router.get("/job/:jobId/top", protect, getTopApplicants);               // New route
router.put("/:id/status", protect, updateStatus);

module.exports = router;