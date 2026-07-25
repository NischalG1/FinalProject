const User = require("../models/User");
const Job = require("../models/Jobs");
const Application = require("../models/Application");
const SavedJob = require("../models/SavedJobs");
const { createNotification } = require("./notificationController");

// @desc    Get all users with their details
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    console.log(`Found ${users.length} users in database`);

    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        let stats = {};
        if (user.role === "employer") {
          const jobCount = await Job.countDocuments({ company: user._id });
          stats.jobCount = jobCount || 0;
        } else if (user.role === "jobseeker") {
          const applicationCount = await Application.countDocuments({
            applicant: user._id,
          });
          stats.applicationCount = applicationCount || 0;
        }
        return {
          ...user,
          ...stats,
        };
      })
    );

    console.log(`Returning ${usersWithStats.length} users with stats`);
    res.json(usersWithStats);
  } catch (err) {
    console.error("Error in getAllUsers:", err);
    res.status(500).json({ message: err.message });
  }
};

// @desc    Delete/Remove a user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user._id.toString()) {
      return res
        .status(400)
        .json({ message: "You cannot delete your own account" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "employer") {
      await Job.deleteMany({ company: user._id });
    } else if (user.role === "jobseeker") {
      await Application.deleteMany({ applicant: user._id });
    }

    await User.findByIdAndDelete(id);

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get all pending jobs
exports.getPendingJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ status: "pending" })
      .populate("company", "name companyName companyLogo email")
      .sort({ createdAt: -1 })
      .lean();

    console.log(`Found ${jobs.length} pending jobs`);
    res.json(jobs);
  } catch (err) {
    console.error("Error in getPendingJobs:", err);
    res.status(500).json({ message: err.message });
  }
};

// @desc    Approve a job
exports.approveJob = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id).populate("company", "name companyName companyLogo email");

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    job.status = "approved";
    await job.save();

    const jobObj = job.toObject ? job.toObject() : job;

    // Create notification for the employer
    await createNotification({
      recipient: job.company._id,
      sender: req.user._id,
      type: "job_approved",
      title: "Job Approved! 🎉",
      message: `Your job "${job.title}" has been approved and is now live. Candidates can now apply.`,
      link: `/manage-jobs`,
      priority: "high",
      data: {
        jobId: job._id,
        jobTitle: job.title,
        companyId: job.company._id,
      }
    });

    res.json({ message: "Job approved successfully", job: jobObj });
  } catch (err) {
    console.error("Error in approveJob:", err);
    res.status(500).json({ message: err.message });
  }
};

// @desc    Reject a job
exports.rejectJob = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id).populate("company", "name companyName companyLogo email");

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    job.status = "rejected";
    await job.save();

    const jobObj = job.toObject ? job.toObject() : job;

    // Create notification for the employer
    await createNotification({
      recipient: job.company._id,
      sender: req.user._id,
      type: "job_rejected",
      title: "Job Update",
      message: `Your job "${job.title}" was not approved. Please review the requirements and resubmit.`,
      link: `/manage-jobs`,
      priority: "high",
      data: {
        jobId: job._id,
        jobTitle: job.title,
        companyId: job.company._id,
        rejectionReason: "Please review job details and resubmit",
      }
    });

    res.json({ message: "Job rejected successfully", job: jobObj });
  } catch (err) {
    console.error("Error in rejectJob:", err);
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get all jobs (for admin dashboard)
exports.getAllJobs = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};

    const jobs = await Job.find(query)
      .populate("company", "name companyName companyLogo email")
      .sort({ createdAt: -1 })
      .lean();

    res.json(jobs);
  } catch (err) {
    console.error("Error in getAllJobs:", err);
    res.status(500).json({ message: err.message });
  }
};

// @desc    Delete a job (Admin only)
exports.deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Notify the employer that their job was deleted
    await createNotification({
      recipient: job.company,
      sender: req.user._id,
      type: "system",
      title: "Job Removed",
      message: `Your job "${job.title}" has been removed by an administrator.`,
      link: `/manage-jobs`,
      priority: "high",
      data: {
        jobId: job._id,
        jobTitle: job.title,
        reason: "Removed by admin",
      }
    });

    await Application.deleteMany({ job: job._id });
    await SavedJob.deleteMany({ job: job._id });
    await Job.findByIdAndDelete(id);

    console.log(`Job ${id} deleted by admin`);
    res.json({ message: "Job deleted successfully" });
  } catch (err) {
    console.error("Error in deleteJob:", err);
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get recent activity for admin dashboard
// @route   GET /api/admin/activity
// @access  Private (Admin only)
exports.getRecentActivity = async (req, res) => {
  try {
    const recentUsers = await User.find({})
      .select("name email role avatar createdAt")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const recentJobs = await Job.find({})
      .populate("company", "name companyName")
      .select("title company status createdAt")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const recentApplications = await Application.find({})
      .populate("applicant", "name email")
      .populate("job", "title")
      .select("applicant job status createdAt")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const activities = [];

    recentUsers.forEach(user => {
      activities.push({
        id: `user_${user._id}`,
        type: "user",
        action: "New user registered",
        user: user.name || "Unknown User",
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        time: user.createdAt,
        timestamp: user.createdAt
      });
    });

    recentJobs.forEach(job => {
      const companyName = job.company?.companyName || job.company?.name || "Unknown Company";
      let action = "New job posted";
      if (job.status === "approved") action = "Job approved";
      else if (job.status === "rejected") action = "Job rejected";
      else if (job.status === "pending") action = "Job pending review";
      
      activities.push({
        id: `job_${job._id}`,
        type: "job",
        action: action,
        user: companyName,
        jobTitle: job.title,
        status: job.status,
        time: job.createdAt,
        timestamp: job.createdAt
      });
    });

    recentApplications.forEach(app => {
      const applicantName = app.applicant?.name || "Unknown Applicant";
      const jobTitle = app.job?.title || "Unknown Job";
      let action = `Applied to "${jobTitle}"`;
      
      activities.push({
        id: `app_${app._id}`,
        type: "application",
        action: action,
        user: applicantName,
        status: app.status,
        time: app.createdAt,
        timestamp: app.createdAt
      });
    });

    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json(activities.slice(0, 10));
  } catch (err) {
    console.error("Error in getRecentActivity:", err);
    res.status(500).json({ message: err.message });
  }
};