// backend/services/cache/CacheService.js
const NodeCache = require('node-cache');

// Initialize cache with default TTL of 1 hour (3600 seconds)
// Check for expired entries every 2 minutes (120 seconds)
const myCache = new NodeCache({ 
    stdTTL: 3600, 
    checkperiod: 120 
});

class CacheService {
    /**
     * Get cached data by key
     * @param {string} key - Cache key
     * @returns {any} - Cached data or undefined
     */
    static get(key) {
        try {
            return myCache.get(key);
        } catch (error) {
            console.error('Cache get error:', error);
            return undefined;
        }
    }

    /**
     * Set data in cache
     * @param {string} key - Cache key
     * @param {any} value - Data to cache
     * @param {number} ttl - Time to live in seconds (optional)
     */
    static set(key, value, ttl = 3600) {
        try {
            myCache.set(key, value, ttl);
        } catch (error) {
            console.error('Cache set error:', error);
        }
    }

    /**
     * Delete cached data by key
     * @param {string} key - Cache key
     */
    static delete(key) {
        try {
            myCache.del(key);
        } catch (error) {
            console.error('Cache delete error:', error);
        }
    }

    /**
     * Clear all cached data
     */
    static flush() {
        try {
            myCache.flushAll();
        } catch (error) {
            console.error('Cache flush error:', error);
        }
    }

    /**
     * Generate cache key for user recommendations
     * @param {string} userId - User ID
     * @returns {string} - Cache key
     */
    static getRecommendationKey(userId) {
        return `recommendations_${userId}`;
    }

    /**
     * Generate cache key for similar jobs
     * @param {string} jobId - Job ID
     * @param {number} limit - Limit of results
     * @returns {string} - Cache key
     */
    static getSimilarJobsKey(jobId, limit = 5) {
        return `similar_jobs_${jobId}_${limit}`;
    }
}

module.exports = CacheService;