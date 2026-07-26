// backend/routes/recommendationRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const {
    getRecommendedJobs,
    getSimilarJobs,
    getCollaborativeRecommendations,
    clearRecommendationCache
} = require("../controllers/recommendationController");
const CacheService = require("../services/cache/CacheService");

// GET /api/recommendations - Get job recommendations for user
router.get("/", protect, async (req, res, next) => {
    try {
        const cacheKey = CacheService.getRecommendationKey(req.user._id);
        const cachedData = CacheService.get(cacheKey);
        
        if (cachedData) {
            console.log(`Returning cached recommendations for user ${req.user._id}`);
            return res.json(cachedData);
        }
        next();
    } catch (error) {
        console.error('Cache middleware error:', error);
        next();
    }
}, getRecommendedJobs);

// GET /api/recommendations/similar/:jobId - Get similar jobs
router.get("/similar/:jobId", getSimilarJobs);

// GET /api/recommendations/collaborative - Collaborative filtering
router.get("/collaborative", protect, getCollaborativeRecommendations);

// POST /api/recommendations/clear-cache - Clear recommendation cache
router.post("/clear-cache", protect, clearRecommendationCache);

module.exports = router;