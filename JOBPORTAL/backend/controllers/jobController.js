// backend/controllers/jobController.js
const Job = require("../models/Jobs");
const User = require("../models/User");
const Application = require("../models/Application");
const SavedJob = require("../models/SavedJobs");

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

        res.status(201).json(job);
    } catch (err) {
        console.error("Error creating job:", err);
        res.status(500).json({ message: err.message });
    }
};

// @desc    Get all jobs with filters and user status
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
            "name companyName companyLogo"
        );

        let savedJobIds = [];
        let appliedJobStatusMap = {};

        if (userId) {
            const savedJobs = await SavedJob.find({ jobseeker: userId }).select("job");
            savedJobIds = savedJobs.map((s) => String(s.job));

            const applications = await Application.find({ applicant: userId }).select("job status");
            applications.forEach((app) => {
                appliedJobStatusMap[String(app.job)] = app.status;
            });
        }

        const jobsWithExtras = jobs.map((job) => {
            const jobIdStr = String(job._id);
            return {
                ...job.toObject(),
                isSaved: savedJobIds.includes(jobIdStr),
                applicationStatus: appliedJobStatusMap[jobIdStr] || null,
            };
        });

        res.json(jobsWithExtras);
    } catch (err) {
        console.error("Error in getJobs:", err);
        res.status(500).json({ message: err.message });
    }
};

// @desc    Get jobs for logged in user (Employer can see posted jobs)
// FIXED VERSION
exports.getJobsEmployer = async (req, res) => {
    try {
        console.log('[getJobsEmployer] Starting...');
        
        // Check if user exists
        if (!req.user) {
            console.log('[getJobsEmployer] No user found in request');
            return res.status(401).json({ message: "User not authenticated" });
        }

        console.log('[getJobsEmployer] User ID:', req.user._id);
        console.log('[getJobsEmployer] User role:', req.user.role);

        // Check if user is employer
        if (req.user.role !== "employer") {
            console.log('[getJobsEmployer] Access denied - role is:', req.user.role);
            return res.status(403).json({ message: "Access denied. Employers only." });
        }

        // Get jobs for this employer - SIMPLE QUERY FIRST
        const jobs = await Job.find({ company: req.user._id })
            .sort({ createdAt: -1 })
            .lean();

        console.log('[getJobsEmployer] Found jobs:', jobs.length);

        // If no jobs, return empty array
        if (!jobs || jobs.length === 0) {
            console.log('[getJobsEmployer] No jobs found for this employer');
            return res.json([]);
        }

        // Get application counts for each job
        const jobIds = jobs.map(job => job._id);
        
        // Use aggregation for better performance
        const applicationCounts = await Application.aggregate([
            { $match: { job: { $in: jobIds } } },
            { $group: { _id: '$job', count: { $sum: 1 } } }
        ]);

        // Create a map of jobId -> count
        const countMap = {};
        applicationCounts.forEach(item => {
            countMap[item._id.toString()] = item.count;
        });

        // Format response with application counts
        const result = jobs.map(job => {
            const jobObj = { ...job };
            jobObj.applicationCount = countMap[job._id.toString()] || 0;
            
            // Ensure company data exists (even if not populated)
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
        
        // Send detailed error response
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
            "name companyName companyLogo"
        );

        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        let applicationStatus = null;

        if (userId) {
            const application = await Application.findOne({
                job: job._id,
                applicant: userId,
            }).select("status");

            if (application) {
                applicationStatus = application.status;
            }
        }

        res.json({
            ...job.toObject(),
            applicationStatus,
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

        Object.assign(job, req.body);
        const updated = await job.save();
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

        // Check if user owns this job
        if (job.company.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to modify this job" });
        }

        // Check if job is approved before allowing toggle
        if (job.status !== "approved") {
            return res.status(400).json({ 
                message: `Cannot ${job.isClosed ? 'reopen' : 'close'} a job that is ${job.status}. Only approved jobs can be opened or closed.` 
            });
        }

        // Toggle the status
        job.isClosed = !job.isClosed;
        await job.save();

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