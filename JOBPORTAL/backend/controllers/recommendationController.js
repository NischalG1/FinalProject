// backend/controllers/recommendationController.js
const natural = require("natural");
const Job = require("../models/Jobs");
const User = require("../models/User");
const Application = require("../models/Application");
const SavedJob = require("../models/SavedJobs");
const RecommenderService = require("../services/recommendation/RecommenderService");
const CacheService = require("../services/cache/CacheService");

// @desc    Get hybrid recommendations for jobseeker
// @route   GET /api/jobs/recommendations
// @access  Private (jobseeker only)
exports.getRecommendedJobs = async (req, res) => {
    try {
        // 1. Validate user role
        if (req.user.role !== "jobseeker") {
            return res.status(403).json({ 
                message: "Only job seekers can get recommendations" 
            });
        }

        const userId = req.user._id;
        
        // 2. Check if user has profile data
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const hasProfileData = 
            (user.skills && user.skills.length > 0) ||
            user.preferredCategory || 
            user.preferredJobType || 
            user.preferredLocation || 
            user.experienceLevel;

        if (!hasProfileData) {
            return res.json({
                recommendations: [],
                message: "Complete your profile with skills and preferences to get personalized recommendations.",
                hasProfile: true,
                totalRecommended: 0
            });
        }

        // 3. Get hybrid recommendations using our new service
        const recommendations = await RecommenderService.getHybridRecommendations(
            userId, 
            parseInt(req.query.limit) || 20
        );
        
        // 4. Get saved and applied status for the user
        const savedJobs = await SavedJob.find({ jobseeker: userId }).select("job");
        const savedJobIds = savedJobs.map(s => String(s.job));

        const applications = await Application.find({ applicant: userId }).select("job status");
        const appliedJobStatusMap = {};
        applications.forEach(app => {
            appliedJobStatusMap[String(app.job)] = app.status;
        });

        // 5. Format response with additional data
        const formattedRecommendations = recommendations.map((item) => {
            const job = item.job.toObject();
            const jobIdStr = String(job._id);
            
            // Calculate match percentage (max possible score ≈ 1.0)
            const matchPercentage = Math.round(Math.min((item.score / 1.0) * 100, 100));
            
            return {
                ...job,
                matchScore: matchPercentage,
                matchDetails: item.matchDetails,
                isSaved: savedJobIds.includes(jobIdStr),
                applicationStatus: appliedJobStatusMap[jobIdStr] || null
            };
        });

        // 6. Cache the results for future requests
        const cacheKey = CacheService.getRecommendationKey(userId);
        CacheService.set(cacheKey, {
            recommendations: formattedRecommendations,
            hasProfile: true,
            totalRecommended: formattedRecommendations.length,
            message: `Found ${formattedRecommendations.length} recommended jobs based on your profile.`
        }, 1800); // Cache for 30 minutes

        // 7. Send response
        res.json({
            recommendations: formattedRecommendations,
            hasProfile: true,
            totalRecommended: formattedRecommendations.length,
            message: `Found ${formattedRecommendations.length} recommended jobs based on your profile.`
        });

    } catch (err) {
        console.error("Recommendation error:", err);
        res.status(500).json({ 
            message: "Failed to get recommendations", 
            error: err.message 
        });
    }
};

// @desc    Get similar jobs for a specific job
// @route   GET /api/jobs/:jobId/similar
// @access  Public
exports.getSimilarJobs = async (req, res) => {
    try {
        const { jobId } = req.params;
        const limit = parseInt(req.query.limit) || 5;

        // Check cache first
        const cacheKey = CacheService.getSimilarJobsKey(jobId, limit);
        const cachedData = CacheService.get(cacheKey);
        
        if (cachedData) {
            console.log('Returning cached similar jobs');
            return res.json(cachedData);
        }

        // Get the target job
        const targetJob = await Job.findById(jobId);
        if (!targetJob) {
            return res.status(404).json({ message: "Job not found" });
        }

        // Find similar jobs based on skills, category, and type
        const similarJobs = await Job.find({
            _id: { $ne: jobId }, // Exclude the target job
            isClosed: false,
            status: "approved",
            $or: [
                { category: targetJob.category },
                { type: targetJob.type },
                { skills: { $in: targetJob.skills || [] } }
            ]
        })
        .populate("company", "name companyName companyLogo")
        .limit(limit * 2); // Get more to filter and sort

        // Score and sort similar jobs
        const scoredSimilar = similarJobs.map(job => {
            // Calculate skill match
            const skillMatch = RecommenderService.calculateSkillMatch(
                targetJob.skills || [],
                job.skills || []
            );
            
            // Category match
            const categoryMatch = targetJob.category === job.category ? 1 : 0;
            
            // Type match
            const typeMatch = targetJob.type === job.type ? 1 : 0;
            
            // Location match (if both have location)
            const locationMatch = targetJob.location && job.location && 
                targetJob.location.toLowerCase() === job.location.toLowerCase() ? 1 : 0;
            
            // Calculate total similarity score
            const score = (skillMatch * 0.4) + (categoryMatch * 0.3) + (typeMatch * 0.2) + (locationMatch * 0.1);
            
            return {
                ...job.toObject(),
                similarityScore: Math.round(score * 100),
                matchDetails: {
                    skillMatch: Math.round(skillMatch * 100),
                    categoryMatch: Math.round(categoryMatch * 100),
                    typeMatch: Math.round(typeMatch * 100),
                    locationMatch: Math.round(locationMatch * 100)
                }
            };
        });

        // Sort by similarity score and limit results
        const finalResults = scoredSimilar
            .sort((a, b) => b.similarityScore - a.similarityScore)
            .slice(0, limit);

        // Cache the results
        CacheService.set(cacheKey, {
            similarJobs: finalResults,
            totalFound: finalResults.length
        }, 3600); // Cache for 1 hour

        res.json({
            similarJobs: finalResults,
            totalFound: finalResults.length
        });

    } catch (err) {
        console.error("Similar jobs error:", err);
        res.status(500).json({ 
            message: "Failed to get similar jobs", 
            error: err.message 
        });
    }
};

// @desc    Get collaborative recommendations (jobs liked by similar users)
// @route   GET /api/jobs/collaborative-recommendations
// @access  Private (jobseeker only)
exports.getCollaborativeRecommendations = async (req, res) => {
    try {
        // 1. Validate user role
        if (req.user.role !== "jobseeker") {
            return res.status(403).json({ 
                message: "Only job seekers can get recommendations" 
            });
        }

        const userId = req.user._id;
        const limit = parseInt(req.query.limit) || 10;

        // 2. Get collaborative recommendations
        const recommendations = await RecommenderService.getCollaborativeRecommendations(
            userId, 
            limit
        );

        // 3. Get saved and applied status
        const savedJobs = await SavedJob.find({ jobseeker: userId }).select("job");
        const savedJobIds = savedJobs.map(s => String(s.job));

        const applications = await Application.find({ applicant: userId }).select("job status");
        const appliedJobStatusMap = {};
        applications.forEach(app => {
            appliedJobStatusMap[String(app.job)] = app.status;
        });

        // 4. Format response
        const formattedRecommendations = recommendations.map((item) => {
            const job = item.job.toObject();
            const jobIdStr = String(job._id);
            const matchPercentage = Math.round(Math.min((item.score / 1.0) * 100, 100));
            
            return {
                ...job,
                matchScore: matchPercentage,
                matchDetails: item.matchDetails,
                isSaved: savedJobIds.includes(jobIdStr),
                applicationStatus: appliedJobStatusMap[jobIdStr] || null
            };
        });

        res.json({
            recommendations: formattedRecommendations,
            totalRecommended: formattedRecommendations.length,
            message: `Found ${formattedRecommendations.length} collaborative recommendations.`
        });

    } catch (err) {
        console.error("Collaborative recommendation error:", err);
        res.status(500).json({ 
            message: "Failed to get collaborative recommendations", 
            error: err.message 
        });
    }
};

// @desc    Clear recommendation cache
// @route   POST /api/jobs/recommendations/clear-cache
// @access  Private
exports.clearRecommendationCache = async (req, res) => {
    try {
        const userId = req.user._id;
        const cacheKey = CacheService.getRecommendationKey(userId);
        CacheService.delete(cacheKey);
        
        res.json({ 
            message: "Recommendation cache cleared successfully",
            cleared: true
        });
    } catch (err) {
        console.error("Clear cache error:", err);
        res.status(500).json({ 
            message: "Failed to clear cache", 
            error: err.message 
        });
    }
};