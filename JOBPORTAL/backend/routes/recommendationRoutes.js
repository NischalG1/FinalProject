// backend/routes/recommendationRoutes.js
const express = require("express");
const { getRecommendedJobs } = require("../controllers/recommendationController");
const { protect } = require("../middlewares/authMiddleware");
const CacheService = require("../services/cache/CacheService");

const router = express.Router();

// GET /api/jobs/recommendations with caching middleware
router.get("/recommendations", protect, async (req, res, next) => {
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

module.exports = router;