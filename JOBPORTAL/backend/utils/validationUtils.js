// backend/utils/validationUtils.js
/**
 * Utility functions for validating input data
 */

/**
 * Validate that an array contains only valid strings
 * @param {Array} arr - Array to validate
 * @returns {boolean} - True if valid
 */
const isValidStringArray = (arr) => {
    if (!Array.isArray(arr)) return false;
    return arr.every(item => typeof item === 'string' && item.trim().length > 0);
};

/**
 * Validate salary range
 * @param {number} min - Minimum salary
 * @param {number} max - Maximum salary
 * @returns {boolean} - True if valid
 */
const isValidSalaryRange = (min, max) => {
    if (min === undefined && max === undefined) return true;
    if (min !== undefined && (typeof min !== 'number' || min < 0)) return false;
    if (max !== undefined && (typeof max !== 'number' || max < 0)) return false;
    if (min !== undefined && max !== undefined && min > max) return false;
    return true;
};

/**
 * Validate experience level
 * @param {string} level - Experience level
 * @returns {boolean} - True if valid
 */
const isValidExperienceLevel = (level) => {
    const validLevels = ['', 'Entry', 'Mid', 'Senior', 'Lead'];
    return validLevels.includes(level);
};

/**
 * Validate job type
 * @param {string} type - Job type
 * @returns {boolean} - True if valid
 */
const isValidJobType = (type) => {
    const validTypes = ['Remote', 'Full-Time', 'Part-Time', 'Internship', 'Contract'];
    return validTypes.includes(type);
};

/**
 * Sanitize string input
 * @param {string} str - String to sanitize
 * @returns {string} - Sanitized string
 */
const sanitizeString = (str) => {
    if (!str || typeof str !== 'string') return '';
    return str.trim().replace(/[<>]/g, ''); // Remove HTML tags
};

module.exports = {
    isValidStringArray,
    isValidSalaryRange,
    isValidExperienceLevel,
    isValidJobType,
    sanitizeString
};