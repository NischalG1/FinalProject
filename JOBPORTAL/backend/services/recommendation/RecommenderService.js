// backend/services/recommendation/RecommenderService.js
const natural = require("natural");
const Job = require("../../models/Jobs");
const User = require("../../models/User");
const Application = require("../../models/Application");
const SavedJob = require("../../models/SavedJobs");
const {
    calculateSkillMatch,
    calculateExperienceMatch,
    calculateLocationMatch,
    calculateSalaryMatch,
    calculateWeightedScore
} = require("../../utils/scoringUtils");

class RecommenderService {
    // Weight configuration for different matching factors
    static WEIGHTS = {
        SKILL_MATCH: 0.35,
        EXPERIENCE_MATCH: 0.20,
        LOCATION_MATCH: 0.15,
        SALARY_MATCH: 0.10,
        CATEGORY_MATCH: 0.10,
        JOB_TYPE_MATCH: 0.10
    };

    /**
     * Get hybrid recommendations for a user
     * Combines content-based filtering with collaborative filtering
     * @param {string} userId - User ID
     * @param {number} limit - Maximum number of recommendations
     * @returns {Array} - Array of recommended jobs with scores
     */
    static async getHybridRecommendations(userId, limit = 20) {
        try {
            console.log(`Getting hybrid recommendations for user: ${userId}`);

            // 1. Get user profile
            const user = await User.findById(userId);
            if (!user) {
                throw new Error("User not found");
            }

            // 2. Get user's interactions (applications + saved jobs)
            const applications = await Application.find({ applicant: userId }).select('job');
            const savedJobs = await SavedJob.find({ jobseeker: userId }).select('job');

            // Create set of interacted job IDs to exclude
            const interactedJobIds = new Set([
                ...applications.map(a => a.job.toString()),
                ...savedJobs.map(s => s.job.toString())
            ]);

            console.log(`User has interacted with ${interactedJobIds.size} jobs`);

            // 3. Get all approved, open jobs
            const jobs = await Job.find({
                isClosed: false,
                status: "approved"
            }).populate("company", "name companyName companyLogo");

            if (jobs.length === 0) {
                console.log("No jobs available for recommendations");
                return [];
            }

            console.log(`Found ${jobs.length} jobs to score`);

            // 4. Score each job
            const scoredJobs = jobs.map(job => {
                const jobId = job._id.toString();

                // Skip if user already interacted with this job
                if (interactedJobIds.has(jobId)) {
                    return {
                        job,
                        score: -1,
                        interacted: true,
                        matchDetails: null
                    };
                }

                // Calculate individual scores using shared utilities
                const skillMatch = calculateSkillMatch(user.skills, job.skills);
                const experienceMatch = calculateExperienceMatch(user.experienceLevel, job);
                const locationMatch = calculateLocationMatch(user.preferredLocation, job.location);
                const salaryMatch = calculateSalaryMatch(
                    user.expectedSalaryMin,
                    user.expectedSalaryMax,
                    job.salaryMin,
                    job.salaryMax
                );
                const categoryMatch = user.preferredCategory?.toLowerCase() === job.category?.toLowerCase() ? 1 : 0;
                const jobTypeMatch = user.preferredJobType?.toLowerCase() === job.type?.toLowerCase() ? 1 : 0;

                const scores = {
                    skill: skillMatch,
                    experience: experienceMatch,
                    location: locationMatch,
                    salary: salaryMatch,
                    category: categoryMatch,
                    jobType: jobTypeMatch
                };

                // Calculate weighted total score using shared utility
                const totalScore = calculateWeightedScore(scores, this.WEIGHTS);

                // Return job with scores and match details
                return {
                    job,
                    score: totalScore,
                    interacted: false,
                    matchDetails: {
                        skillMatch: Math.round(skillMatch * 100),
                        experienceMatch: Math.round(experienceMatch * 100),
                        locationMatch: Math.round(locationMatch * 100),
                        salaryMatch: Math.round(salaryMatch * 100),
                        categoryMatch: Math.round(categoryMatch * 100),
                        jobTypeMatch: Math.round(jobTypeMatch * 100)
                    }
                };
            });

            // 5. Filter and sort recommendations
            const recommendations = scoredJobs
                .filter(item => !item.interacted && item.score > 0.05)
                .sort((a, b) => b.score - a.score)
                .slice(0, limit);

            console.log(`Returning ${recommendations.length} recommendations`);
            return recommendations;

        } catch (error) {
            console.error("Error in hybrid recommendation:", error);
            throw error;
        }
    }

    /**
     * Find similar users using collaborative filtering
     * @param {string} userId - User ID
     * @param {number} limit - Maximum number of similar users
     * @returns {Array} - Array of similar users
     */
    static async findSimilarUsers(userId, limit = 10) {
        try {
            // Get current user's applications
            const userApps = await Application.find({ applicant: userId }).select('job');
            const userJobIds = userApps.map(a => a.job.toString());

            if (userJobIds.length === 0) {
                return [];
            }

            // Find other users who applied to the same jobs
            const similarUsers = await Application.aggregate([
                {
                    $match: {
                        job: { $in: userJobIds },
                        applicant: { $ne: userId }
                    }
                },
                {
                    $group: {
                        _id: '$applicant',
                        commonJobs: { $push: '$job' },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } },
                { $limit: limit }
            ]);

            return similarUsers;

        } catch (error) {
            console.error("Error finding similar users:", error);
            throw error;
        }
    }

    /**
     * Get collaborative filtering recommendations
     * Finds jobs that similar users have applied to
     * @param {string} userId - User ID
     * @param {number} limit - Maximum number of recommendations
     * @returns {Array} - Array of recommended jobs
     */
    static async getCollaborativeRecommendations(userId, limit = 10) {
        try {
            // Find similar users
            const similarUsers = await this.findSimilarUsers(userId, 5);

            if (similarUsers.length === 0) {
                return [];
            }

            // Get user IDs of similar users
            const similarUserIds = similarUsers.map(u => u._id);

            // Get jobs that similar users applied to
            const similarUsersApps = await Application.find({
                applicant: { $in: similarUserIds }
            }).select('job').lean();

            // Count job frequencies
            const jobFrequency = {};
            similarUsersApps.forEach(app => {
                const jobId = app.job.toString();
                jobFrequency[jobId] = (jobFrequency[jobId] || 0) + 1;
            });

            // Get current user's interacted jobs
            const userApps = await Application.find({ applicant: userId }).select('job');
            const userSaved = await SavedJob.find({ jobseeker: userId }).select('job');
            const userInteracted = new Set([
                ...userApps.map(a => a.job.toString()),
                ...userSaved.map(s => s.job.toString())
            ]);

            // Filter out jobs user already interacted with
            const recommendedJobIds = Object.keys(jobFrequency)
                .filter(jobId => !userInteracted.has(jobId))
                .sort((a, b) => jobFrequency[b] - jobFrequency[a])
                .slice(0, limit);

            // Fetch job details
            const recommendedJobs = await Job.find({
                _id: { $in: recommendedJobIds }
            }).populate("company", "name companyName companyLogo");

            // Add frequency score
            return recommendedJobs.map(job => ({
                job,
                score: jobFrequency[job._id.toString()] / similarUsers.length,
                matchDetails: {
                    collaborativeScore: Math.round((jobFrequency[job._id.toString()] / similarUsers.length) * 100)
                }
            }));

        } catch (error) {
            console.error("Error in collaborative recommendations:", error);
            throw error;
        }
    }
}

module.exports = RecommenderService;