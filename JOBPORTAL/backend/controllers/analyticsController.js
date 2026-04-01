const Job = require("../models/Jobs");
const Application = require("../models/Application");
const SavedJob = require("../models/SavedJobs");

const getTrend = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

exports.getEmployerAnalytics = async (req, res) => {
  try {
    if (req.user.role !== "employer") {
      return res.status(403).json({ message: "Access denied" });
    }

    const companyId = req.user._id;

    const now = new Date();
    const last7Days = new Date(now);
    last7Days.setDate(now.getDate() - 7);
    const prev7Days = new Date(now);
    prev7Days.setDate(now.getDate() - 14);

    // === COUNTS ===
    const totalActiveJobs = await Job.countDocuments({
      company: companyId,
      isClosed: false,
    });
    const jobs = await Job.find({ company: companyId }).select("_id").lean();
    const jobIds = jobs.map((job) => job._id);

    const totalApplications = await Application.countDocuments({
      job: { $in: jobIds },
    });
    const totalHired = await Application.countDocuments({
      job: { $in: jobIds },
      status: "Accepted",
    });

    // === TRENDS ===

    // Active Job Posts trend
    const activeJobsLast7 = await Job.countDocuments({
      company: companyId,
      createdAt: { $gte: last7Days, $lte: now },
    });

    const activeJobsPrev7 = await Job.countDocuments({
      company: companyId,
      createdAt: { $gte: prev7Days, $lt: last7Days },
    });

    const activeJobTrend = getTrend(activeJobsLast7, activeJobsPrev7);

    // Applications trend
    const applicationsLast7 = await Application.countDocuments({
      job: { $in: jobIds },
      createdAt: { $gte: last7Days, $lte: now },
    });

    const applicationsPrev7 = await Application.countDocuments({
      job: { $in: jobIds },
      createdAt: { $gte: prev7Days, $lt: last7Days },
    });

    const applicantTrend = getTrend(applicationsLast7, applicationsPrev7);

    // Hired Applicants trend
    const hiredLast7 = await Application.countDocuments({
      job: { $in: jobIds },
      status: "Accepted",
      createdAt: { $gte: last7Days, $lte: now },
    });

    const hiredPrev7 = await Application.countDocuments({
      job: { $in: jobIds },
      status: "Accepted",
      createdAt: { $gte: prev7Days, $lt: last7Days },
    });
    const hiredTrend = getTrend(hiredLast7, hiredPrev7);

    // === DATA ===
    const recentJobs = await Job.find({ company: companyId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title location type createdAt isClosed");

    const recentApplications = await Application.find({
      job: { $in: jobIds },
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("applicant", "name email avatar")
      .populate("job", "title");

    res.json({
      counts: {
        totalActiveJobs,
        totalApplications,
        totalHired,
        trends: {
          activeJobs: activeJobTrend,
          totalApplicants: applicantTrend,
          totalHired: hiredTrend,
        },
      },
      data: {
        recentJobs,
        recentApplications,
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch analytics", error: err.message });
  }
};

// @desc    Get jobseeker analytics/dashboard overview
exports.getJobSeekerAnalytics = async (req, res) => {
  try {
    if (req.user.role !== "jobseeker") {
      return res.status(403).json({ message: "Access denied" });
    }

    const jobseekerId = req.user._id;

    const now = new Date();
    const last7Days = new Date(now);
    last7Days.setDate(now.getDate() - 7);
    const prev7Days = new Date(now);
    prev7Days.setDate(now.getDate() - 14);

    // === COUNTS ===
    const totalApplications = await Application.countDocuments({
      applicant: jobseekerId,
    });

    const applicationsByStatus = {
      Applied: await Application.countDocuments({
        applicant: jobseekerId,
        status: "Applied",
      }),
      "In Review": await Application.countDocuments({
        applicant: jobseekerId,
        status: "In Review",
      }),
      Accepted: await Application.countDocuments({
        applicant: jobseekerId,
        status: "Accepted",
      }),
      Rejected: await Application.countDocuments({
        applicant: jobseekerId,
        status: "Rejected",
      }),
    };

    const totalSavedJobs = await SavedJob.countDocuments({
      jobseeker: jobseekerId,
    });

    // === TRENDS ===

    // Applications trend (last 7 days vs previous 7 days)
    const applicationsLast7 = await Application.countDocuments({
      applicant: jobseekerId,
      createdAt: { $gte: last7Days, $lte: now },
    });

    const applicationsPrev7 = await Application.countDocuments({
      applicant: jobseekerId,
      createdAt: { $gte: prev7Days, $lt: last7Days },
    });

    const applicationsTrend = getTrend(applicationsLast7, applicationsPrev7);

    // Saved jobs trend
    const savedJobsLast7 = await SavedJob.countDocuments({
      jobseeker: jobseekerId,
      createdAt: { $gte: last7Days, $lte: now },
    });

    const savedJobsPrev7 = await SavedJob.countDocuments({
      jobseeker: jobseekerId,
      createdAt: { $gte: prev7Days, $lt: last7Days },
    });

    const savedJobsTrend = getTrend(savedJobsLast7, savedJobsPrev7);

    // === DATA ===
    const recentApplications = await Application.find({
      applicant: jobseekerId,
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({
        path: "job",
        select: "title location type company",
        populate: {
          path: "company",
          select: "name companyName companyLogo",
        },
      })
      .lean();

    const recentSavedJobs = await SavedJob.find({ jobseeker: jobseekerId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({
        path: "job",
        select: "title location type company createdAt",
        populate: {
          path: "company",
          select: "name companyName companyLogo",
        },
      })
      .lean();

    res.json({
      counts: {
        totalApplications,
        applicationsByStatus,
        totalSavedJobs,
        trends: {
          applications: applicationsTrend,
          savedJobs: savedJobsTrend,
        },
      },
      data: {
        recentApplications,
        recentSavedJobs,
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch analytics", error: err.message });
  }
};
