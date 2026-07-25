// backend/controllers/applicationController.js
const Application = require("../models/Application");
const Job = require("../models/Jobs");
const User = require("../models/User");
const { createNotification } = require("./notificationController");

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

        // Get job details for notification
        const job = await Job.findById(req.params.jobId).populate("company", "name companyName email title");

        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        const application = await Application.create({
            job: req.params.jobId,
            applicant: req.user._id,
            resume: req.user.resume,
        });

        // Notification: Employer - New application received
        await createNotification({
            recipient: job.company._id,
            sender: req.user._id,
            type: "new_application",
            title: "New Application Received! 📄",
            message: `${req.user.name} has applied for "${job.title}"`,
            link: `/applicants?jobId=${job._id}`,
            priority: "high",
            data: {
                jobId: job._id,
                jobTitle: job.title,
                applicationId: application._id,
                applicantId: req.user._id,
                applicantName: req.user.name,
                applicantEmail: req.user.email,
            }
        });

        // Notification: Applicant - Application submitted successfully
        await createNotification({
            recipient: req.user._id,
            sender: req.user._id,
            type: "application_status",
            title: "Application Submitted! ✅",
            message: `Your application for "${job.title}" has been submitted successfully.`,
            link: `/job/${job._id}`,
            priority: "medium",
            data: {
                jobId: job._id,
                jobTitle: job.title,
                applicationId: application._id,
                status: "Applied",
            }
        });

        res.status(201).json(application);
    } catch (err) {
        console.error("Apply to job error:", err);
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

        const app = await Application.findById(req.params.id)
            .populate({
                path: "job",
                select: "title company",
                populate: {
                    path: "company",
                    select: "name companyName",
                }
            })
            .populate("applicant", "name email");

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

        const oldStatus = app.status;
        app.status = status;
        await app.save();

        // Notification: Applicant - Status update
        let title = "";
        let message = "";
        let priority = "medium";
        let icon = "";

        switch (status) {
            case "Accepted":
                title = "🎉 Application Accepted!";
                message = `Congratulations! Your application for "${app.job.title}" at ${app.job.company?.name || app.job.company?.companyName || "the company"} has been accepted.`;
                priority = "high";
                icon = "🎉";
                break;
            case "Rejected":
                title = "Application Update";
                message = `Your application for "${app.job.title}" has been reviewed. We appreciate your interest and encourage you to apply for future opportunities.`;
                priority = "medium";
                icon = "📧";
                break;
            case "In Review":
                title = "Application Under Review";
                message = `Your application for "${app.job.title}" is now being reviewed by the hiring team at ${app.job.company?.name || app.job.company?.companyName || "the company"}.`;
                priority = "medium";
                icon = "🔍";
                break;
            default:
                title = "Application Status Updated";
                message = `Your application for "${app.job.title}" has been updated to ${status}.`;
                priority = "low";
                icon = "📋";
        }

        // Only send notification if status actually changed
        if (oldStatus !== status) {
            await createNotification({
                recipient: app.applicant._id,
                sender: req.user._id,
                type: "application_status",
                title: title,
                message: message,
                link: `/job/${app.job._id}`,
                priority: priority,
                data: {
                    jobId: app.job._id,
                    jobTitle: app.job.title,
                    applicationId: app._id,
                    oldStatus: oldStatus,
                    newStatus: status,
                    companyName: app.job.company?.name || app.job.company?.companyName || "Company",
                }
            });

            // If accepted, also notify the applicant with additional details
            if (status === "Accepted") {
                await createNotification({
                    recipient: app.applicant._id,
                    sender: req.user._id,
                    type: "system",
                    title: "Next Steps for Your Accepted Application",
                    message: `The hiring team at ${app.job.company?.name || app.job.company?.companyName || "the company"} will be in touch with you regarding your application for "${app.job.title}". Check your email for updates.`,
                    link: `/job/${app.job._id}`,
                    priority: "high",
                    data: {
                        jobId: app.job._id,
                        jobTitle: app.job.title,
                        applicationId: app._id,
                    }
                });
            }
        }

        res.json({ message: "Application status updated", status });
    } catch (err) {
        console.error("Update status error:", err);
        res.status(500).json({ message: err.message });
    }
};

// ============================================
// SCORING FUNCTIONS
// ============================================

// Helper functions for applicant scoring
const calculateApplicantSkillMatch = (jobSkills, applicantSkills) => {
    if (!jobSkills || !applicantSkills || jobSkills.length === 0 || applicantSkills.length === 0) {
        return 0;
    }
    
    const jobSkillSet = new Set(jobSkills.map(s => s.toLowerCase().trim()));
    const applicantSkillSet = new Set(applicantSkills.map(s => s.toLowerCase().trim()));
    
    const intersection = new Set([...jobSkillSet].filter(s => applicantSkillSet.has(s)));
    const union = new Set([...jobSkillSet, ...applicantSkillSet]);
    
    return intersection.size / union.size;
};

const calculateApplicantExperienceMatch = (applicantLevel, job) => {
    if (!applicantLevel) return 0.3;
    
    const jobText = `${job.title || ''} ${job.description || ''} ${job.requirements || ''}`.toLowerCase();
    
    const levelKeywords = {
        Entry: ["entry", "junior", "fresher", "graduate", "0-1", "0-2", "intern", "trainee"],
        Mid: ["mid", "intermediate", "2-5", "3-5", "2+", "3+", "mid-level"],
        Senior: ["senior", "lead", "5+", "7+", "experienced", "sr."],
        Lead: ["lead", "principal", "architect", "manager", "head", "director", "8+", "10+"]
    };
    
    const keywords = levelKeywords[applicantLevel] || [];
    if (keywords.length === 0) return 0.3;
    
    let matchCount = 0;
    keywords.forEach(kw => {
        if (jobText.includes(kw)) matchCount++;
    });
    
    return Math.min(matchCount / keywords.length, 1.0);
};

const calculateApplicantLocationMatch = (applicantLocation, jobLocation) => {
    if (!applicantLocation || !jobLocation) return 0.3;
    
    const aLoc = applicantLocation.toLowerCase().trim();
    const jLoc = jobLocation.toLowerCase().trim();
    
    if (aLoc === jLoc) return 1.0;
    if (jLoc.includes(aLoc) || aLoc.includes(jLoc)) return 0.8;
    
    const aWords = aLoc.split(' ');
    const jWords = jLoc.split(' ');
    const commonWords = aWords.filter(word => jWords.includes(word));
    
    return commonWords.length > 0 ? 0.6 : 0;
};

// @desc    Get applicants with scoring for a job
// @route   GET /api/applications/job/:jobId/scoring
// @access  Private (Employer only)
exports.getApplicantsWithScoring = async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId);
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        const jobCompanyId = job.company._id?.toString() || job.company?.toString();
        if (jobCompanyId !== req.user._id.toString()) {
            return res.status(403).json({ 
                message: "Not authorized to view applicants for this job" 
            });
        }

        const applications = await Application.find({ job: req.params.jobId })
            .populate("applicant", "name email avatar resume skills experienceLevel preferredLocation")
            .populate("job", "title location category type skills description requirements")
            .lean();

        if (applications.length === 0) {
            return res.json({
                job: {
                    title: job.title,
                    skills: job.skills || []
                },
                applicants: [],
                totalApplicants: 0,
                message: "No applications found for this job"
            });
        }

        const scoredApplicants = applications.map(app => {
            const applicant = app.applicant;
            
            const skillMatch = calculateApplicantSkillMatch(job.skills || [], applicant.skills || []);
            const experienceMatch = calculateApplicantExperienceMatch(applicant.experienceLevel, job);
            const locationMatch = calculateApplicantLocationMatch(applicant.preferredLocation, job.location);
            
            const daysSinceJobPosted = (Date.now() - new Date(job.createdAt)) / (1000 * 60 * 60 * 24);
            const daysSinceApplication = (Date.now() - new Date(app.createdAt)) / (1000 * 60 * 60 * 24);
            const timelinessScore = Math.max(0, 1 - (daysSinceApplication / (daysSinceJobPosted + 1)));
            
            const hasRequiredSkills = skillMatch > 0.3 ? 1 : 0;
            
            const totalScore = 
                (skillMatch * 0.35) +
                (experienceMatch * 0.25) +
                (locationMatch * 0.15) +
                (timelinessScore * 0.10) +
                (hasRequiredSkills * 0.15);

            let strength = "Average";
            if (totalScore >= 0.8) strength = "Excellent";
            else if (totalScore >= 0.6) strength = "Good";
            else if (totalScore >= 0.4) strength = "Average";
            else strength = "Needs Review";

            return {
                ...app,
                scoreDetails: {
                    skillMatch: Math.round(skillMatch * 100),
                    experienceMatch: Math.round(experienceMatch * 100),
                    locationMatch: Math.round(locationMatch * 100),
                    timelinessScore: Math.round(timelinessScore * 100),
                    hasRequiredSkills: hasRequiredSkills === 1,
                    totalScore: Math.round(totalScore * 100)
                },
                totalScore: Math.round(totalScore * 100),
                strength: strength,
                appliedDate: app.createdAt
            };
        });

        scoredApplicants.sort((a, b) => b.totalScore - a.totalScore);

        const avgScore = scoredApplicants.reduce((sum, app) => sum + app.totalScore, 0) / scoredApplicants.length;
        const topApplicants = scoredApplicants.filter(app => app.totalScore >= 70);
        const excellentApplicants = scoredApplicants.filter(app => app.strength === "Excellent");

        // If there are excellent applicants, notify the employer
        if (excellentApplicants.length > 0) {
            await createNotification({
                recipient: req.user._id,
                sender: req.user._id,
                type: "system",
                title: "🌟 Excellent Candidates Found!",
                message: `There ${excellentApplicants.length === 1 ? 'is' : 'are'} ${excellentApplicants.length} excellent candidate${excellentApplicants.length > 1 ? 's' : ''} for "${job.title}". Check them out!`,
                link: `/applicants?jobId=${job._id}`,
                priority: "medium",
                data: {
                    jobId: job._id,
                    jobTitle: job.title,
                    excellentCount: excellentApplicants.length,
                }
            });
        }

        res.json({
            job: {
                id: job._id,
                title: job.title,
                location: job.location,
                category: job.category,
                type: job.type,
                skills: job.skills || [],
                requiredExperience: job.requirements || ""
            },
            applicants: scoredApplicants,
            statistics: {
                totalApplicants: scoredApplicants.length,
                averageScore: Math.round(avgScore),
                topApplicants: topApplicants.length,
                excellentApplicants: excellentApplicants.length,
                applicationDistribution: {
                    excellent: excellentApplicants.length,
                    good: scoredApplicants.filter(app => app.strength === "Good").length,
                    average: scoredApplicants.filter(app => app.strength === "Average").length,
                    needsReview: scoredApplicants.filter(app => app.strength === "Needs Review").length
                }
            },
            message: `Found ${scoredApplicants.length} applicants with scoring`
        });

    } catch (err) {
        console.error("Error in getApplicantsWithScoring:", err);
        res.status(500).json({ 
            message: "Failed to get applicants with scoring", 
            error: err.message 
        });
    }
};

// @desc    Get shortlisted applicants (top performers)
// @route   GET /api/applications/job/:jobId/top
// @access  Private (Employer only)
exports.getTopApplicants = async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId);
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        const jobCompanyId = job.company._id?.toString() || job.company?.toString();
        if (jobCompanyId !== req.user._id.toString()) {
            return res.status(403).json({ 
                message: "Not authorized to view applicants for this job" 
            });
        }

        const limit = parseInt(req.query.limit) || 5;
        const threshold = parseInt(req.query.threshold) || 70;

        const applications = await Application.find({ job: req.params.jobId })
            .populate("applicant", "name email avatar resume skills experienceLevel preferredLocation")
            .populate("job", "title location category type skills")
            .lean();

        const scoredApplicants = applications.map(app => {
            const applicant = app.applicant;
            const skillMatch = calculateApplicantSkillMatch(job.skills || [], applicant.skills || []);
            const experienceMatch = calculateApplicantExperienceMatch(applicant.experienceLevel, job);
            const locationMatch = calculateApplicantLocationMatch(applicant.preferredLocation, job.location);
            const hasRequiredSkills = skillMatch > 0.3 ? 1 : 0;
            
            const totalScore = 
                (skillMatch * 0.35) +
                (experienceMatch * 0.25) +
                (locationMatch * 0.15) +
                (hasRequiredSkills * 0.25);

            return {
                ...app,
                totalScore: Math.round(totalScore * 100),
                skillMatch: Math.round(skillMatch * 100),
                experienceMatch: Math.round(experienceMatch * 100),
                locationMatch: Math.round(locationMatch * 100)
            };
        });

        const topApplicants = scoredApplicants
            .filter(app => app.totalScore >= threshold)
            .sort((a, b) => b.totalScore - a.totalScore)
            .slice(0, limit);

        // If we found top applicants, notify the employer
        if (topApplicants.length > 0) {
            await createNotification({
                recipient: req.user._id,
                sender: req.user._id,
                type: "system",
                title: "🎯 Top Candidates Available!",
                message: `There ${topApplicants.length === 1 ? 'is' : 'are'} ${topApplicants.length} highly qualified candidate${topApplicants.length > 1 ? 's' : ''} for "${job.title}".`,
                link: `/applicants?jobId=${job._id}`,
                priority: "medium",
                data: {
                    jobId: job._id,
                    jobTitle: job.title,
                    topCount: topApplicants.length,
                    threshold: threshold,
                }
            });
        }

        res.json({
            job: {
                id: job._id,
                title: job.title
            },
            topApplicants: topApplicants,
            criteria: {
                threshold: threshold,
                limit: limit,
                totalQualified: scoredApplicants.filter(app => app.totalScore >= threshold).length
            }
        });

    } catch (err) {
        console.error("Error in getTopApplicants:", err);
        res.status(500).json({ 
            message: "Failed to get top applicants", 
            error: err.message 
        });
    }
};