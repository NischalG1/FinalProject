// backend/services/recommendation/RecommenderService.js
const natural = require("natural");
const Job = require("../../models/Jobs");
const User = require("../../models/User");
const Application = require("../../models/Application");
const SavedJob = require("../../models/SavedJobs");

class RecommenderService {
    // Weight configuration for different matching factors
    static WEIGHTS = {
        SKILL_MATCH: 0.35,        // Skills overlap percentage
        EXPERIENCE_MATCH: 0.20,   // Experience level alignment
        LOCATION_MATCH: 0.15,     // Location preference
        SALARY_MATCH: 0.10,       // Salary range compatibility
        CATEGORY_MATCH: 0.10,     // Job category alignment
        JOB_TYPE_MATCH: 0.10      // Full-time/Remote/etc.
    };

    /**
     * Calculate skills overlap using Jaccard Similarity
     * @param {Array} userSkills - Array of user skills
     * @param {Array} jobSkills - Array of job skills
     * @returns {number} - Similarity score between 0 and 1
     */
    static calculateSkillMatch(userSkills, jobSkills) {
        if (!userSkills || !jobSkills || userSkills.length === 0 || jobSkills.length === 0) {
            return 0;
        }
        
        // Convert to lowercase and trim for better matching
        const userSkillSet = new Set(userSkills.map(s => s.toLowerCase().trim()));
        const jobSkillSet = new Set(jobSkills.map(s => s.toLowerCase().trim()));
        
        // Calculate intersection
        const intersection = new Set([...userSkillSet].filter(s => jobSkillSet.has(s)));
        
        // Calculate union
        const union = new Set([...userSkillSet, ...jobSkillSet]);
        
        // Jaccard similarity = intersection size / union size
        return intersection.size / union.size;
    }

    /**
     * Calculate experience level compatibility
     * @param {string} userLevel - User's experience level
     * @param {Object} job - Job object with title, description, requirements
     * @returns {number} - Match score between 0 and 1
     */
    static calculateExperienceMatch(userLevel, job) {
        if (!userLevel) return 0.3; // Neutral score if no experience specified
        
        // Combine job text for keyword searching
        const jobText = `${job.title || ''} ${job.description || ''} ${job.requirements || ''}`.toLowerCase();
        
        // Experience level keywords mapping
        const levelKeywords = {
            Entry: ["entry", "junior", "fresher", "graduate", "0-1", "0-2", "intern", "trainee"],
            Mid: ["mid", "intermediate", "2-5", "3-5", "2+", "3+", "mid-level", "mid level"],
            Senior: ["senior", "lead", "5+", "7+", "experienced", "sr.", "senior level"],
            Lead: ["lead", "principal", "architect", "manager", "head", "director", "8+", "10+", "tech lead"]
        };
        
        const keywords = levelKeywords[userLevel] || [];
        if (keywords.length === 0) return 0.3;
        
        // Count how many keywords appear in job text
        let matchCount = 0;
        keywords.forEach(kw => {
            if (jobText.includes(kw)) matchCount++;
        });
        
        // Calculate match score (max 1.0)
        return Math.min(matchCount / keywords.length, 1.0);
    }

    /**
     * Calculate salary range compatibility
     * @param {number} userMin - User's minimum expected salary
     * @param {number} userMax - User's maximum expected salary
     * @param {number} jobMin - Job's minimum salary
     * @param {number} jobMax - Job's maximum salary
     * @returns {number} - Match score between 0 and 1
     */
    static calculateSalaryMatch(userMin, userMax, jobMin, jobMax) {
        // Handle missing salary data
        if (!userMin && !userMax) return 0;
        if (!jobMin && !jobMax) return 0.5;
        
        // Set defaults
        const uMin = userMin || 0;
        const uMax = userMax || Number.MAX_SAFE_INTEGER;
        const jMin = jobMin || 0;
        const jMax = jobMax || Number.MAX_SAFE_INTEGER;
        
        // Check if ranges overlap
        if (uMin > jMax || jMin > uMax) return 0;
        
        // Calculate overlap percentage
        const overlapStart = Math.max(uMin, jMin);
        const overlapEnd = Math.min(uMax, jMax);
        const overlap = Math.max(0, overlapEnd - overlapStart);
        
        // Calculate range sizes
        const userRange = uMax - uMin || 1;
        const jobRange = jMax - jMin || 1;
        
        // Average of overlap ratios
        const userOverlapRatio = overlap / userRange;
        const jobOverlapRatio = overlap / jobRange;
        
        return (userOverlapRatio + jobOverlapRatio) / 2;
    }

    /**
     * Calculate location compatibility
     * @param {string} userLocation - User's preferred location
     * @param {string} jobLocation - Job's location
     * @returns {number} - Match score between 0 and 1
     */
    static calculateLocationMatch(userLocation, jobLocation) {
        if (!userLocation || !jobLocation) return 0.3;
        
        const uLoc = userLocation.toLowerCase().trim();
        const jLoc = jobLocation.toLowerCase().trim();
        
        // Exact match
        if (uLoc === jLoc) return 1.0;
        
        // Contains match (e.g., "New York" matches "New York City")
        if (jLoc.includes(uLoc) || uLoc.includes(jLoc)) return 0.8;
        
        // Partial match (e.g., "NY" matches "New York")
        const uWords = uLoc.split(' ');
        const jWords = jLoc.split(' ');
        const commonWords = uWords.filter(word => jWords.includes(word));
        
        if (commonWords.length > 0) {
            return 0.6;
        }
        
        // No match
        return 0;
    }

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

                // Calculate individual scores
                const skillMatch = this.calculateSkillMatch(user.skills, job.skills);
                const experienceMatch = this.calculateExperienceMatch(user.experienceLevel, job);
                const locationMatch = this.calculateLocationMatch(user.preferredLocation, job.location);
                const salaryMatch = this.calculateSalaryMatch(
                    user.expectedSalaryMin,
                    user.expectedSalaryMax,
                    job.salaryMin,
                    job.salaryMax
                );
                const categoryMatch = user.preferredCategory?.toLowerCase() === job.category?.toLowerCase() ? 1 : 0;
                const jobTypeMatch = user.preferredJobType?.toLowerCase() === job.type?.toLowerCase() ? 1 : 0;

                // Calculate weighted total score
                const totalScore = 
                    (skillMatch * this.WEIGHTS.SKILL_MATCH) +
                    (experienceMatch * this.WEIGHTS.EXPERIENCE_MATCH) +
                    (locationMatch * this.WEIGHTS.LOCATION_MATCH) +
                    (salaryMatch * this.WEIGHTS.SALARY_MATCH) +
                    (categoryMatch * this.WEIGHTS.CATEGORY_MATCH) +
                    (jobTypeMatch * this.WEIGHTS.JOB_TYPE_MATCH);

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