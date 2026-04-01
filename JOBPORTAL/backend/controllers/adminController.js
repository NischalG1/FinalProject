const User = require("../models/User");
const Job = require("../models/Jobs");
const Application = require("../models/Application");
const SavedJob = require("../models/SavedJobs");

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

    // Prevent admin from deleting themselves
    if (id === req.user._id.toString()) {
      return res
        .status(400)
        .json({ message: "You cannot delete your own account" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete all related data
    if (user.role === "employer") {
      // Delete all jobs posted by this employer
      await Job.deleteMany({ company: user._id });
    } else if (user.role === "jobseeker") {
      // Delete all applications by this jobseeker
      await Application.deleteMany({ applicant: user._id });
    }

    // Delete the user
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

    // Delete all related applications
    await Application.deleteMany({ job: job._id });
    
    // Delete all saved jobs references
    await SavedJob.deleteMany({ job: job._id });

    // Delete the job
    await Job.findByIdAndDelete(id);

    console.log(`Job ${id} deleted by admin`);
    res.json({ message: "Job deleted successfully" });
  } catch (err) {
    console.error("Error in deleteJob:", err);
    res.status(500).json({ message: err.message });
  }
};
