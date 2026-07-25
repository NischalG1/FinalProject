// backend/controllers/savedJobController.js
const SavedJob = require("../models/SavedJobs");
const Job = require("../models/Jobs");
const { createNotification } = require("./notificationController");

// @desc Save a job
exports.saveJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user._id;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Check if already saved
    const exists = await SavedJob.findOne({
      job: jobId,
      jobseeker: userId,
    });
    
    if (exists) {
      return res.status(400).json({ message: "Job already saved" });
    }

    const saved = await SavedJob.create({
      job: jobId,
      jobseeker: userId,
    });

    // Create notification for job seeker
    await createNotification({
      recipient: userId,
      type: "job_saved",
      title: "Job Saved! 📌",
      message: `You have saved "${job.title}" at ${job.company?.name || 'a company'}.`,
      link: `/job/${jobId}`,
      priority: "low",
      data: {
        jobId: jobId,
        jobTitle: job.title,
      }
    });

    res.status(201).json({
      success: true,
      message: "Job saved successfully",
      data: saved
    });
  } catch (err) {
    console.error("Save job error:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to save job", 
      error: err.message 
    });
  }
};

// @desc Unsave a job
exports.unsaveJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user._id;

    const deleted = await SavedJob.findOneAndDelete({
      job: jobId,
      jobseeker: userId,
    });
    
    if (!deleted) {
      return res.status(404).json({ 
        success: false,
        message: "Saved job not found" 
      });
    }
    
    res.json({ 
      success: true,
      message: "Job removed from saved list" 
    });
  } catch (err) {
    console.error("Unsave job error:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to remove saved job", 
      error: err.message 
    });
  }
};

// @desc Get saved jobs for current user
exports.getMySavedJobs = async (req, res) => {
  try {
    const savedJobs = await SavedJob.find({ jobseeker: req.user._id })
      .populate({
        path: "job",
        populate: {
          path: "company",
          select: "name companyName companyLogo",
        },
      })
      .sort({ createdAt: -1 });

    // Filter out any null jobs (in case a job was deleted)
    const validSavedJobs = savedJobs.filter(item => item.job !== null);

    res.json({
      success: true,
      count: validSavedJobs.length,
      data: validSavedJobs
    });
  } catch (err) {
    console.error("Get saved jobs error:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch saved jobs", 
      error: err.message 
    });
  }
};