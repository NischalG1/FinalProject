const natural = require("natural");
const Job = require("../models/Jobs");
const User = require("../models/User");
const Application = require("../models/Application");
const SavedJob = require("../models/SavedJobs");

/**
 * Content-Based Filtering Recommendation Engine
 * Uses TF-IDF + Cosine Similarity to match user profiles with job listings.
 *
 * Matching signals (weighted):
 * 1. TF-IDF text similarity on skills, description, requirements
 * 2. Exact category match bonus
 * 3. Exact job type match bonus
 * 4. Location match bonus
 * 5. Salary range overlap bonus
 * 6. Experience level keyword presence bonus
 */

// Weight configuration for scoringqq
const WEIGHTS = {
  TFIDF_BASE: 1.0,           // Base weight for TF-IDF text similarity
  CATEGORY_MATCH: 0.25,       // Bonus for exact category match
  JOB_TYPE_MATCH: 0.15,       // Bonus for exact job type match
  LOCATION_MATCH: 0.15,       // Bonus for location match
  SALARY_OVERLAP: 0.10,       // Bonus for salary range overlap
  EXPERIENCE_MATCH: 0.10,     // Bonus for experience level keyword match
};

/**
 * Build a text document from user profile for TF-IDF comparison
 */
function buildUserDocument(user) {
  const parts = [];

  // Skills are the primary matching signal
  if (user.skills && user.skills.length > 0) {
    // Repeat skills to give them more weight in TF-IDF
    parts.push(user.skills.join(" "));
    parts.push(user.skills.join(" "));
  }

  if (user.preferredCategory) parts.push(user.preferredCategory);
  if (user.preferredJobType) parts.push(user.preferredJobType);
  if (user.preferredLocation) parts.push(user.preferredLocation);
  if (user.experienceLevel) parts.push(user.experienceLevel);

  return parts.join(" ").toLowerCase();
}

/**
 * Build a text document from a job listing for TF-IDF comparison
 */
function buildJobDocument(job) {
  const parts = [];

  if (job.title) parts.push(job.title);
  if (job.skills && job.skills.length > 0) {
    // Repeat skills to give them more weight
    parts.push(job.skills.join(" "));
    parts.push(job.skills.join(" "));
  }
  if (job.description) parts.push(job.description);
  if (job.requirements) parts.push(job.requirements);
  if (job.category) parts.push(job.category);
  if (job.type) parts.push(job.type);
  if (job.location) parts.push(job.location);

  return parts.join(" ").toLowerCase();
}

/**
 * Check if salary ranges overlap
 */
function salaryOverlaps(userMin, userMax, jobMin, jobMax) {
  if (!userMin && !userMax) return false;
  if (!jobMin && !jobMax) return false;

  const uMin = userMin || 0;
  const uMax = userMax || Infinity;
  const jMin = jobMin || 0;
  const jMax = jobMax || Infinity;

  return uMin <= jMax && jMin <= uMax;
}

/**
 * Check if location matches (case-insensitive substring match)
 */
function locationMatches(userLocation, jobLocation) {
  if (!userLocation || !jobLocation) return false;
  const uLoc = userLocation.toLowerCase().trim();
  const jLoc = jobLocation.toLowerCase().trim();
  return jLoc.includes(uLoc) || uLoc.includes(jLoc);
}

/**
 * Check if experience level keywords appear in job text
 */
function experienceMatches(userLevel, jobText) {
  if (!userLevel || !jobText) return false;

  const levelKeywords = {
    Entry: ["entry", "junior", "fresher", "graduate", "0-1", "0-2", "intern"],
    Mid: ["mid", "intermediate", "2-5", "3-5", "2+", "3+"],
    Senior: ["senior", "lead", "5+", "7+", "experienced", "sr."],
    Lead: ["lead", "principal", "architect", "manager", "head", "director", "8+", "10+"],
  };

  const keywords = levelKeywords[userLevel] || [];
  const text = jobText.toLowerCase();

  return keywords.some((kw) => text.includes(kw));
}

// @desc    Get recommended jobs for the authenticated jobseeker
// @route   GET /api/jobs/recommendations
// @access  Private (jobseeker only)
exports.getRecommendedJobs = async (req, res) => {
  try {
    // 1. Validate user role
    if (req.user.role !== "jobseeker") {
      return res.status(403).json({ message: "Only job seekers can get recommendations" });
    }

    // 2. Fetch full user profile
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 3. Check if user has any profile data for recommendations
    const hasProfileData =
      (user.skills && user.skills.length > 0) ||
      user.preferredCategory ||
      user.preferredJobType ||
      user.preferredLocation ||
      user.experienceLevel;

    if (!hasProfileData) {
      return res.json({
        recommendations: [],
        message: "Complete your profile with skills and preferences to get personalized recommendations.",
        hasProfile: false,
      });
    }

    // 4. Fetch all approved, open jobs
    const jobs = await Job.find({
      isClosed: false,
      status: "approved",
    }).populate("company", "name companyName companyLogo");

    if (jobs.length === 0) {
      return res.json({
        recommendations: [],
        message: "No jobs available at the moment.",
        hasProfile: true,
      });
    }

    // 5. Build TF-IDF model
    const TfIdf = natural.TfIdf;
    const tfidf = new TfIdf();

    // Document 0 = user profile
    const userDoc = buildUserDocument(user);
    tfidf.addDocument(userDoc);

    // Documents 1..N = job listings
    const jobDocuments = jobs.map((job) => buildJobDocument(job));
    jobDocuments.forEach((doc) => tfidf.addDocument(doc));

    // 6. Extract user terms for TF-IDF scoring
    const tokenizer = new natural.WordTokenizer();
    const userTerms = [...new Set(tokenizer.tokenize(userDoc))];

    // 7. Score each job
    const scoredJobs = jobs.map((job, index) => {
      const jobDocIndex = index + 1; // offset by 1 since user doc is at 0

      // TF-IDF similarity: sum the TF-IDF values of user terms in the job document
      let tfidfScore = 0;
      userTerms.forEach((term) => {
        tfidfScore += tfidf.tfidf(term, jobDocIndex);
      });

      // Normalize TF-IDF score (avoid division by zero)
      const maxPossibleScore = userTerms.length > 0 ? userTerms.length * 5 : 1;
      let normalizedTfidf = Math.min(tfidfScore / maxPossibleScore, 1.0);

      // Apply base weight
      let totalScore = normalizedTfidf * WEIGHTS.TFIDF_BASE;

      // Bonus: exact category match
      if (
        user.preferredCategory &&
        job.category &&
        user.preferredCategory.toLowerCase() === job.category.toLowerCase()
      ) {
        totalScore += WEIGHTS.CATEGORY_MATCH;
      }

      // Bonus: exact job type match
      if (
        user.preferredJobType &&
        job.type &&
        user.preferredJobType.toLowerCase() === job.type.toLowerCase()
      ) {
        totalScore += WEIGHTS.JOB_TYPE_MATCH;
      }

      // Bonus: location match
      if (locationMatches(user.preferredLocation, job.location)) {
        totalScore += WEIGHTS.LOCATION_MATCH;
      }

      // Bonus: salary overlap
      if (
        salaryOverlaps(
          user.expectedSalaryMin,
          user.expectedSalaryMax,
          job.salaryMin,
          job.salaryMax
        )
      ) {
        totalScore += WEIGHTS.SALARY_OVERLAP;
      }

      // Bonus: experience level match
      const jobText = `${job.title || ""} ${job.description || ""} ${job.requirements || ""}`;
      if (experienceMatches(user.experienceLevel, jobText)) {
        totalScore += WEIGHTS.EXPERIENCE_MATCH;
      }

      return {
        job,
        score: totalScore,
      };
    });

    // 8. Sort by score descending, filter out zero-score jobs
    const rankedJobs = scoredJobs
      .filter((item) => item.score > 0.01)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20); // Top 20 recommendations

    // 9. Fetch saved/applied status for the user
    const savedJobs = await SavedJob.find({ jobseeker: user._id }).select("job");
    const savedJobIds = savedJobs.map((s) => String(s.job));

    const applications = await Application.find({ applicant: user._id }).select("job status");
    const appliedJobStatusMap = {};
    applications.forEach((app) => {
      appliedJobStatusMap[String(app.job)] = app.status;
    });

    // 10. Build response with score and status info
    const recommendations = rankedJobs.map((item) => {
      const jobIdStr = String(item.job._id);
      // Convert score to a percentage (max possible ≈ 1.75)
      const matchPercentage = Math.round(Math.min((item.score / 1.75) * 100, 100));

      return {
        ...item.job.toObject(),
        matchScore: matchPercentage,
        isSaved: savedJobIds.includes(jobIdStr),
        applicationStatus: appliedJobStatusMap[jobIdStr] || null,
      };
    });

    res.json({
      recommendations,
      hasProfile: true,
      message: `Found ${recommendations.length} recommended jobs based on your profile.`,
    });
  } catch (err) {
    console.error("Recommendation error:", err);
    res.status(500).json({ message: err.message });
  }
};
