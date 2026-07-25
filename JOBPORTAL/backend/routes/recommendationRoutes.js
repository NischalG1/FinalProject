// backend/routes/recommendationRoutes.js
const express = require("express");
const { 
  getRecommendedJobs,
  getSimilarJobs,
  getCollaborativeRecommendations,
  clearRecommendationCache
} = require("../controllers/recommendationController");
const { protect } = require("../middlewares/authMiddleware");
const CacheService = require("../services/cache/CacheService");

const router = express.Router();

// GET /api/recommendations - Main recommendations endpoint
router.get("/", protect, async (req, res, next) => {
    try {
        // Check if user has cached recommendations
        const cacheKey = CacheService.getRecommendationKey(req.user._id);
        const cachedData = CacheService.get(cacheKey);
        
        if (cachedData) {
            console.log(`Returning cached recommendations for user ${req.user._id}`);
            return res.json(cachedData);
        }
        
        // No cache found, proceed to controller
        next();
    } catch (error) {
        console.error('Cache middleware error:', error);
        // Continue to controller if cache fails
        next();
    }
}, getRecommendedJobs);

// GET /api/recommendations/similar/:jobId - Similar jobs
router.get("/similar/:jobId", getSimilarJobs);

// GET /api/recommendations/collaborative - Collaborative recommendations
router.get("/collaborative", protect, getCollaborativeRecommendations);

// POST /api/recommendations/clear-cache - Clear recommendation cache
router.post("/clear-cache", protect, clearRecommendationCache);

module.exports = router;