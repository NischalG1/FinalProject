// backend/controllers/jobController.js
const Job = require("../models/Jobs");
const User = require("../models/User");
const Application = require("../models/Application");
const SavedJob = require("../models/SavedJobs");
const { createNotification } = require("./notificationController");

// ========== SCORING HELPER FUNCTIONS ==========

const calculateSkillMatch = (userSkills, jobSkills) => {
    if (!userSkills || !jobSkills || userSkills.length === 0 || jobSkills.length === 0) {
        return 0;
    }
    
    const userSkillSet = new Set(userSkills.map(s => s.toLowerCase().trim()));
    const jobSkillSet = new Set(jobSkills.map(s => s.toLowerCase().trim()));
    
    const intersection = new Set([...userSkillSet].filter(s => jobSkillSet.has(s)));
    const union = new Set([...userSkillSet, ...jobSkillSet]);
    
    return intersection.size / union.size;
};

const calculateExperienceMatch = (userLevel, job) => {
    if (!userLevel) return 0.3;
    
    const jobText = `${job.title || ''} ${job.description || ''} ${job.requirements || ''}`.toLowerCase();
    
    const levelKeywords = {
        Entry: ["entry", "junior", "fresher", "graduate", "0-1", "0-2", "intern", "trainee"],
        Mid: ["mid", "intermediate", "2-5", "3-5", "2+", "3+", "mid-level"],
        Senior: ["senior", "lead", "5+", "7+", "experienced", "sr."],
        Lead: ["lead", "principal", "architect", "manager", "head", "director", "8+", "10+"]
    };
    
    const keywords = levelKeywords[userLevel] || [];
    if (keywords.length === 0) return 0.3;
    
    let matchCount = 0;
    keywords.forEach(kw => {
        if (jobText.includes(kw)) matchCount++;
    });
    
    return Math.min(matchCount / keywords.length, 1.0);
};

const calculateLocationMatch = (userLocation, jobLocation) => {
    if (!userLocation || !jobLocation) return 0.3;
    
    const uLoc = userLocation.toLowerCase().trim();
    const jLoc = jobLocation.toLowerCase().trim();
    
    if (uLoc === jLoc) return 1.0;
    if (jLoc.includes(uLoc) || uLoc.includes(jLoc)) return 0.8;
    
    const uWords = uLoc.split(' ');
    const jWords = jLoc.split(' ');
    const commonWords = uWords.filter(word => jWords.includes(word));
    
    return commonWords.length > 0 ? 0.6 : 0;
};

const calculateSalaryMatch = (userMin, userMax, jobMin, jobMax) => {
    if (!userMin && !userMax) return 0;
    if (!jobMin && !jobMax) return 0.5;
    
    const uMin = userMin || 0;
    const uMax = userMax || Number.MAX_SAFE_INTEGER;
    const jMin = jobMin || 0;
    const jMax = jobMax || Number.MAX_SAFE_INTEGER;
    
    if (uMin > jMax || jMin > uMax) return 0;
    
    const overlapStart = Math.max(uMin, jMin);
    const overlapEnd = Math.min(uMax, jMax);
    const overlap = Math.max(0, overlapEnd - overlapStart);
    
    const userRange = uMax - uMin || 1;
    const jobRange = jMax - jMin || 1;
    
    return (overlap / userRange + overlap / jobRange) / 2;
};

// ========== END SCORING HELPERS ==========

// @desc    Create a new job (Employer only)
exports.createJob = async (req, res) => {
    try {
        if (req.user.role !== "employer") {
            return res.status(403).json({ message: "Only employers can post jobs" });
        }

        const jobData = {
            ...req.body,
            company: req.user._id,
            status: "pending",
            skills: req.body.skills || []
        };

        const job = await Job.create(jobData);
        await job.populate("company", "name companyName companyLogo email");
        
        console.log("New job created:", {
            id: job._id,
            title: job.title,
            status: job.status,
            company: job.company
        });

        const admins = await User.find({ role: "admin" }).select("_id");
        for (const admin of admins) {
            await createNotification({
                recipient: admin._id,
                sender: req.user._id,
                type: "job_posted",
                title: "New Job Pending Approval 📋",
                message: `${req.user.companyName || req.user.name} has posted "${job.title}" and it's waiting for review.`,
                link: `/admin-jobs`,
                priority: "high",
                data: {
                    jobId: job._id,
                    jobTitle: job.title,
                    companyName: req.user.companyName || req.user.name,
                    companyId: req.user._id,
                }
            });
        }

        await createNotification({
            recipient: req.user._id,
            sender: req.user._id,
            type: "job_posted",
            title: "Job Posted Successfully! 📝",
            message: `Your job "${job.title}" has been posted and is pending admin approval. You'll be notified once it's approved.`,
            link: `/manage-jobs`,
            priority: "medium",
            data: {
                jobId: job._id,
                jobTitle: job.title,
                status: "pending",
            }
        });

        res.status(201).json(job);
    } catch (err) {
        console.error("Error creating job:", err);
        res.status(500).json({ message: err.message });
    }
};

// @desc    Get all jobs with filters and user status - WITH MATCH SCORES
exports.getJobs = async (req, res) => {
    const {
        keyword,
        location,
        category,
        type,
        minSalary,
        maxSalary,
        userId,
    } = req.query;

    const query = {
        isClosed: false,
        status: "approved",
        ...(keyword && { title: { $regex: keyword, $options: "i" } }),
        ...(location && { location: { $regex: location, $options: "i" } }),
        ...(category && { category }),
        ...(type && { type }),
    };

    if (minSalary || maxSalary) {
        query.$and = [];
        if (minSalary) {
            query.$and.push({ salaryMax: { $gte: Number(minSalary) } });
        }
        if (maxSalary) {
            query.$and.push({ salaryMin: { $lte: Number(maxSalary) } });
        }
        if (query.$and.length === 0) {
            delete query.$and;
        }
    }

    try {
        const jobs = await Job.find(query).populate(
            "company",
            "name companyName companyLogo email avatar companyDescription companyWebsite companyLocation companyPhone companySize industry foundedYear"
        );

        let savedJobIds = [];
        let appliedJobStatusMap = {};
        let userData = null;
        let userSkills = [];
        let userExperience = '';
        let userLocation = '';
        let userSalaryMin = 0;
        let userSalaryMax = 0;
        let preferredCategory = '';
        let preferredJobType = '';

        if (userId) {
            const user = await User.findById(userId);
            if (user) {
                userData = user;
                userSkills = user.skills || [];
                userExperience = user.experienceLevel || '';
                userLocation = user.preferredLocation || '';
                userSalaryMin = user.expectedSalaryMin || 0;
                userSalaryMax = user.expectedSalaryMax || 0;
                preferredCategory = user.preferredCategory || '';
                preferredJobType = user.preferredJobType || '';
            }

            const savedJobs = await SavedJob.find({ jobseeker: userId }).select("job");
            savedJobIds = savedJobs.map((s) => String(s.job));

            const applications = await Application.find({ applicant: userId }).select("job status");
            applications.forEach((app) => {
                appliedJobStatusMap[String(app.job)] = app.status;
            });
        }

        const jobsWithExtras = jobs.map((job) => {
            const jobIdStr = String(job._id);
            
            let matchScore = null;
            let matchDetails = null;
            
            if (userId && userSkills && userSkills.length > 0) {
                const skillMatch = calculateSkillMatch(userSkills, job.skills || []);
                const experienceMatch = calculateExperienceMatch(userExperience, job);
                const locationMatch = calculateLocationMatch(userLocation, job.location || '');
                const salaryMatch = calculateSalaryMatch(userSalaryMin, userSalaryMax, job.salaryMin, job.salaryMax);
                
                const categoryMatch = (preferredCategory && job.category && preferredCategory.toLowerCase() === job.category.toLowerCase()) ? 1 : 0;
                const jobTypeMatch = (preferredJobType && job.type && preferredJobType.toLowerCase() === job.type.toLowerCase()) ? 1 : 0;
                
                const totalScore = 
                    (skillMatch * 0.35) +
                    (experienceMatch * 0.20) +
                    (locationMatch * 0.15) +
                    (salaryMatch * 0.10) +
                    (categoryMatch * 0.10) +
                    (jobTypeMatch * 0.10);
                
                matchScore = Math.round(Math.min(totalScore * 100, 100));
                matchDetails = {
                    skillMatch: Math.round(skillMatch * 100),
                    experienceMatch: Math.round(experienceMatch * 100),
                    locationMatch: Math.round(locationMatch * 100),
                    salaryMatch: Math.round(salaryMatch * 100),
                    categoryMatch: Math.round(categoryMatch * 100),
                    jobTypeMatch: Math.round(jobTypeMatch * 100)
                };
            }
            
            return {
                ...job.toObject(),
                isSaved: savedJobIds.includes(jobIdStr),
                applicationStatus: appliedJobStatusMap[jobIdStr] || null,
                matchScore: matchScore,
                matchDetails: matchDetails,
            };
        });

        res.json(jobsWithExtras);
    } catch (err) {
        console.error("Error in getJobs:", err);
        res.status(500).json({ message: err.message });
    }
};

// @desc    Get jobs for logged in user (Employer can see posted jobs)
exports.getJobsEmployer = async (req, res) => {
    try {
        console.log('[getJobsEmployer] Starting...');
        
        if (!req.user) {
            console.log('[getJobsEmployer] No user found in request');
            return res.status(401).json({ message: "User not authenticated" });
        }

        console.log('[getJobsEmployer] User ID:', req.user._id);
        console.log('[getJobsEmployer] User role:', req.user.role);

        if (req.user.role !== "employer") {
            console.log('[getJobsEmployer] Access denied - role is:', req.user.role);
            return res.status(403).json({ message: "Access denied. Employers only." });
        }

        const jobs = await Job.find({ company: req.user._id })
            .sort({ createdAt: -1 })
            .lean();

        console.log('[getJobsEmployer] Found jobs:', jobs.length);

        if (!jobs || jobs.length === 0) {
            console.log('[getJobsEmployer] No jobs found for this employer');
            return res.json([]);
        }

        const jobIds = jobs.map(job => job._id);
        
        const applicationCounts = await Application.aggregate([
            { $match: { job: { $in: jobIds } } },
            { $group: { _id: '$job', count: { $sum: 1 } } }
        ]);

        const countMap = {};
        applicationCounts.forEach(item => {
            countMap[item._id.toString()] = item.count;
        });

        const result = jobs.map(job => {
            const jobObj = { ...job };
            jobObj.applicationCount = countMap[job._id.toString()] || 0;
            
            if (!jobObj.company) {
                jobObj.company = {
                    name: req.user.name || "Unknown",
                    companyName: req.user.companyName || "",
                    companyLogo: req.user.companyLogo || ""
                };
            }
            
            return jobObj;
        });

        console.log('[getJobsEmployer] Returning:', result.length, 'jobs with counts');
        res.json(result);

    } catch (err) {
        console.error('[getJobsEmployer] ERROR DETAILS:', err);
        console.error('[getJobsEmployer] ERROR STACK:', err.stack);
        
        res.status(500).json({ 
            message: "Failed to fetch jobs", 
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};

// @desc    Get single job by ID
exports.getJobById = async (req, res) => {
    try {
        const { userId } = req.query;

        const job = await Job.findById(req.params.id).populate(
            "company",
            "name companyName companyLogo email avatar companyDescription companyWebsite companyLocation companyPhone companySize industry foundedYear"
        );

        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        let applicationStatus = null;
        let matchScore = null;
        let matchDetails = null;

        if (userId) {
            const application = await Application.findOne({
                job: job._id,
                applicant: userId,
            }).select("status");

            if (application) {
                applicationStatus = application.status;
            }

            // Calculate match score for single job
            const user = await User.findById(userId);
            if (user && user.skills && user.skills.length > 0) {
                const skillMatch = calculateSkillMatch(user.skills || [], job.skills || []);
                const experienceMatch = calculateExperienceMatch(user.experienceLevel || '', job);
                const locationMatch = calculateLocationMatch(user.preferredLocation || '', job.location || '');
                const salaryMatch = calculateSalaryMatch(
                    user.expectedSalaryMin || 0, 
                    user.expectedSalaryMax || 0, 
                    job.salaryMin, 
                    job.salaryMax
                );
                
                const categoryMatch = (user.preferredCategory && job.category && user.preferredCategory.toLowerCase() === job.category.toLowerCase()) ? 1 : 0;
                const jobTypeMatch = (user.preferredJobType && job.type && user.preferredJobType.toLowerCase() === job.type.toLowerCase()) ? 1 : 0;
                
                const totalScore = 
                    (skillMatch * 0.35) +
                    (experienceMatch * 0.20) +
                    (locationMatch * 0.15) +
                    (salaryMatch * 0.10) +
                    (categoryMatch * 0.10) +
                    (jobTypeMatch * 0.10);
                
                matchScore = Math.round(Math.min(totalScore * 100, 100));
                matchDetails = {
                    skillMatch: Math.round(skillMatch * 100),
                    experienceMatch: Math.round(experienceMatch * 100),
                    locationMatch: Math.round(locationMatch * 100),
                    salaryMatch: Math.round(salaryMatch * 100),
                    categoryMatch: Math.round(categoryMatch * 100),
                    jobTypeMatch: Math.round(jobTypeMatch * 100)
                };
            }
        }

        res.json({
            ...job.toObject(),
            applicationStatus,
            matchScore,
            matchDetails,
        });
    } catch (err) {
        console.error("Error in getJobById:", err);
        res.status(500).json({ message: err.message });
    }
};

// @desc    Update a job (Employer only)
exports.updateJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: "Job not found" });

        if (job.company.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to update this job" });
        }

        const oldStatus = job.status;

        Object.assign(job, req.body);
        const updated = await job.save();

        if (oldStatus !== updated.status) {
            if (updated.status === "approved") {
                await createNotification({
                    recipient: updated.company,
                    sender: req.user._id,
                    type: "job_approved",
                    title: "Job Approved! 🎉",
                    message: `Your job "${updated.title}" has been approved and is now live.`,
                    link: `/manage-jobs`,
                    priority: "high",
                    data: {
                        jobId: updated._id,
                        jobTitle: updated.title,
                        status: updated.status,
                    }
                });
            } else if (updated.status === "rejected") {
                await createNotification({
                    recipient: updated.company,
                    sender: req.user._id,
                    type: "job_rejected",
                    title: "Job Update",
                    message: `Your job "${updated.title}" was not approved. Please review and resubmit.`,
                    link: `/manage-jobs`,
                    priority: "high",
                    data: {
                        jobId: updated._id,
                        jobTitle: updated.title,
                        status: updated.status,
                    }
                });
            }
        }

        res.json(updated);
    } catch (err) {
        console.error("Error in updateJob:", err);
        res.status(500).json({ message: err.message });
    }
};

// @desc    Delete a job (Employer only)
exports.deleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: "Job not found" });

        if (job.company.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to delete this job" });
        }

        await createNotification({
            recipient: req.user._id,
            sender: req.user._id,
            type: "system",
            title: "Job Deleted",
            message: `Your job "${job.title}" has been deleted.`,
            link: `/manage-jobs`,
            priority: "medium",
            data: {
                jobId: job._id,
                jobTitle: job.title,
            }
        });

        await job.deleteOne();
        res.json({ message: "Job deleted successfully" });
    } catch (err) {
        console.error("Error in deleteJob:", err);
        res.status(500).json({ message: err.message });
    }
};

// @desc    Toggle Close Status for a job (Employer only)
exports.toggleCloseJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        if (job.company.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to modify this job" });
        }

        if (job.status !== "approved") {
            return res.status(400).json({ 
                message: `Cannot ${job.isClosed ? 'reopen' : 'close'} a job that is ${job.status}. Only approved jobs can be opened or closed.` 
            });
        }

        job.isClosed = !job.isClosed;
        await job.save();

        const statusMessage = job.isClosed ? "closed" : "reopened";
        await createNotification({
            recipient: req.user._id,
            sender: req.user._id,
            type: "system",
            title: job.isClosed ? "Job Closed" : "Job Reopened",
            message: `Your job "${job.title}" has been ${statusMessage} for applications.`,
            link: `/manage-jobs`,
            priority: "low",
            data: {
                jobId: job._id,
                jobTitle: job.title,
                isClosed: job.isClosed,
            }
        });

        console.log(`[toggleCloseJob] Job ${job._id} ${job.isClosed ? 'closed' : 'reopened'} by employer ${req.user._id}`);

        res.json({ 
            message: job.isClosed ? "Job marked as closed" : "Job marked as open",
            isClosed: job.isClosed,
            jobId: job._id,
            status: job.status
        });
    } catch (err) {
        console.error("Error in toggleCloseJob:", err);
        res.status(500).json({ message: err.message });
    }
};

// @desc    Get jobs by company ID (Public)
exports.getJobsByCompany = async (req, res) => {
    try {
        const { companyId } = req.params;
        
        const jobs = await Job.find({ 
            company: companyId,
            status: "approved",
            isClosed: false
        })
        .select("title location type category salaryMin salaryMax isClosed createdAt")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

        res.json(jobs);
    } catch (err) {
        console.error("Error in getJobsByCompany:", err);
        res.status(500).json({ message: err.message });
    }
};