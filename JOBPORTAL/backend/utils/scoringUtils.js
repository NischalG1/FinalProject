// backend/utils/scoringUtils.js
/**
 * Utility functions for scoring and matching
 */

/**
 * Calculate Jaccard Similarity between two arrays
 */
const calculateJaccardSimilarity = (arr1, arr2) => {
    if (!arr1 || !arr2 || arr1.length === 0 || arr2.length === 0) {
        return 0;
    }

    const set1 = new Set(arr1.map(item => item.toLowerCase().trim()));
    const set2 = new Set(arr2.map(item => item.toLowerCase().trim()));

    const intersection = new Set([...set1].filter(item => set2.has(item)));
    const union = new Set([...set1, ...set2]);

    return intersection.size / union.size;
};

/**
 * Calculate skill match between user and job
 */
const calculateSkillMatch = (userSkills, jobSkills) => {
    return calculateJaccardSimilarity(userSkills, jobSkills);
};

/**
 * Calculate experience match
 */
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

    const matchCount = keywords.filter(kw => jobText.includes(kw)).length;
    return Math.min(matchCount / keywords.length, 1.0);
};

/**
 * Calculate location match
 */
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

/**
 * Calculate salary match
 */
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

/**
 * Determine applicant strength based on score
 */
const getApplicantStrength = (score) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Average";
    return "Needs Review";
};

/**
 * Calculate weighted total score
 */
const calculateWeightedScore = (scores, weights = {}) => {
    const defaultWeights = {
        skill: 0.35,
        experience: 0.20,
        location: 0.15,
        salary: 0.10,
        category: 0.10,
        jobType: 0.10
    };

    const w = { ...defaultWeights, ...weights };

    return (
        (scores.skill || 0) * w.skill +
        (scores.experience || 0) * w.experience +
        (scores.location || 0) * w.location +
        (scores.salary || 0) * w.salary +
        (scores.category || 0) * w.category +
        (scores.jobType || 0) * w.jobType
    );
};

module.exports = {
    calculateJaccardSimilarity,
    calculateSkillMatch,
    calculateExperienceMatch,
    calculateLocationMatch,
    calculateSalaryMatch,
    getApplicantStrength,
    calculateWeightedScore
};