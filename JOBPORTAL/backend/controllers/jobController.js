// backend/controllers/jobController.js
const Job = require("../models/Jobs");
const User = require("../models/User");
const Application = require("../models/Application");
const SavedJob = require("../models/SavedJobs");
const { createNotification } = require("./notificationController");

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

        // Create notification for all admins
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

        // Notify the employer that their job is pending
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
            "name companyName companyLogo email avatar"
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
// backend/controllers/jobController.js
// Update the getJobById function to include avatar

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

        // Store old status for notification
        const oldStatus = job.status;

        Object.assign(job, req.body);
        const updated = await job.save();

        // If status changed from pending, notify relevant parties
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

        // Notify the employer that their job was deleted
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

        // Notify the employer about the status change
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

// backend/controllers/jobController.js
// Add this function at the end of the file

// @desc    Get jobs by company ID (Public)
// @route   GET /api/jobs/company/:companyId
// @access  Public
exports.getJobsByCompany = async (req, res) => {
    try {
        const { companyId } = req.params;
        
        // Find all jobs posted by this company that are approved and open
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