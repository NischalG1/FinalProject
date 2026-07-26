// backend/middlewares/securityMiddleware.js
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const xss = require("xss");
const cors = require("cors");

// Helmet configuration for security headers
const helmetConfig = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"]
        }
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: true,
    crossOriginResourcePolicy: { policy: "same-site" },
    dnsPrefetchControl: true,
    frameguard: { action: "deny" },
    hidePoweredBy: true,
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    ieNoOpen: true,
    noSniff: true,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    xssFilter: true
});

// RATE LIMITING - DISABLED FOR DEVELOPMENT
// Just pass through without any rate limiting
const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
    return (req, res, next) => {
        next(); // No rate limiting applied
    };
};

// AUTH RATE LIMITER - DISABLED FOR DEVELOPMENT
const authRateLimiter = (req, res, next) => {
    next(); // No rate limiting for auth routes
};

// XSS Protection middleware
const xssProtection = (req, res, next) => {
    // Sanitize body
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                req.body[key] = xss(req.body[key]);
            }
        });
    }
    // Sanitize query params
    if (req.query) {
        Object.keys(req.query).forEach(key => {
            if (typeof req.query[key] === 'string') {
                req.query[key] = xss(req.query[key]);
            }
        });
    }
    next();
};

// CORS configuration
const corsOptions = {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Authorization'],
    credentials: true,
    maxAge: 86400 // 24 hours
};

// CSRF Protection (optional - for production)
const csrfProtection = (req, res, next) => {
    // Check if request is from same origin
    const origin = req.headers.origin;
    const host = req.headers.host;

    // Skip for GET, HEAD, OPTIONS
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }

    // Check if origin matches host
    if (origin && !origin.includes(host)) {
        return res.status(403).json({
            message: "CSRF validation failed"
        });
    }
    next();
};

module.exports = {
    helmetConfig,
    createRateLimiter,
    authRateLimiter,
    xssProtection,
    corsOptions,
    csrfProtection
};