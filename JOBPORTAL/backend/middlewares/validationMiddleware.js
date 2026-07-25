// backend/middlewares/validationMiddleware.js
const mongoose = require("mongoose");

/**
 * Validate MongoDB ObjectId
 */
exports.validateObjectId = (paramName = 'id') => {
    return (req, res, next) => {
        const id = req.params[paramName];
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ 
                message: `Invalid ${paramName} format` 
            });
        }
        next();
    };
};

/**
 * Validate required fields
 */
exports.validateRequired = (fields) => {
    return (req, res, next) => {
        const missing = [];
        fields.forEach(field => {
            if (!req.body[field] || req.body[field].toString().trim() === '') {
                missing.push(field);
            }
        });
        
        if (missing.length > 0) {
            return res.status(400).json({
                message: `Missing required fields: ${missing.join(', ')}`
            });
        }
        next();
    };
};

/**
 * Sanitize input
 */
exports.sanitizeInput = (req, res, next) => {
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                req.body[key] = req.body[key].trim();
            }
        });
    }
    next();
};

/**
 * Validate email
 */
exports.validateEmail = (req, res, next) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (req.body.email && !emailRegex.test(req.body.email)) {
        return res.status(400).json({ message: "Invalid email format" });
    }
    next();
};

/**
 * Validate URL
 */
exports.validateUrl = (fieldName) => {
    return (req, res, next) => {
        const url = req.body[fieldName];
        if (url && !url.match(/^https?:\/\/.+/)) {
            return res.status(400).json({ 
                message: `Invalid ${fieldName} format` 
            });
        }
        next();
    };
};

/**
 * Validate salary range
 */
exports.validateSalaryRange = (req, res, next) => {
    const { salaryMin, salaryMax } = req.body;
    if (salaryMin && salaryMax && Number(salaryMin) > Number(salaryMax)) {
        return res.status(400).json({ 
            message: "Minimum salary cannot be greater than maximum salary" 
        });
    }
    next();
};