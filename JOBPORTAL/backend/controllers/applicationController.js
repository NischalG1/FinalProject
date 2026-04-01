const Application = require("../models/Application");
const Job = require("../models/Jobs");

// @desc    Apply to a job
exports.applyToJob = async (req, res) => {
  try {
    if (req.user.role !== "jobseeker") {
      return res.status(403).json({ message: "Only job seekers can apply" });
    }

    const existing = await Application.findOne({
      job: req.params.jobId,
      applicant: req.user._id,
    });

    if (existing) {
      return res.status(400).json({ message: "Already applied to this job" });
    }

    const application = await Application.create({
      job: req.params.jobId,
      applicant: req.user._id,
      resume: req.user.resume, // assuming resume is stored in user profile
    });

    res.status(201).json(application);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get logged-in user's applications
exports.getMyApplications = async (req, res) => {
  try {
    const apps = await Application.find({ applicant: req.user._id })
      .populate({
        path: "job",
        select: "title location type category company createdAt",
        populate: {
          path: "company",
          select: "name companyName companyLogo",
        },
      })
      .sort({ createdAt: -1 });

    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get all applicants for a job (Employer)
exports.getApplicantsForJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);

    if (!job || job.company.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to view applicants" });
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate("job", "title location category type")
      .populate("applicant", "name email avatar resume");

    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get application by ID (Jobseeker or Employer)
exports.getApplicationById = async (req, res) => {
  try {
    const app = await Application.findById(req.params.id)
      .populate({
        path: "job",
        select: "title company",
        populate: {
          path: "company",
          select: "name companyName",
        },
      })
      .populate("applicant", "name email avatar resume");

    if (!app) return res.status(404).json({ message: "Application not found.", id: req.params.id });

    if (!app.job || !app.applicant) {
      return res.status(404).json({ message: "Application data incomplete" });
    }

    const jobCompanyId = app.job.company?._id?.toString() || app.job.company?.toString();
    const isOwner =
      app.applicant._id.toString() === req.user._id.toString() ||
      jobCompanyId === req.user._id.toString();

    if (!isOwner) {
      return res.status(403).json({ message: "Not authorized to view this application" });
    }

    res.json(app);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update application status (Employer)
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Applied", "In Review", "Rejected", "Accepted"];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const app = await Application.findById(req.params.id).populate({
      path: "job",
      select: "company",
    });

    if (!app) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (!app.job) {
      return res.status(404).json({ message: "Job not found for this application" });
    }

    const jobCompanyId = app.job.company?._id?.toString() || app.job.company?.toString();
    if (jobCompanyId !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this application" });
    }

    app.status = status;
    await app.save();

    res.json({ message: "Application status updated", status });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};