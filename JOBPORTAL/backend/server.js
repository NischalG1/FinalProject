// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

// Import security middleware
const {
    helmetConfig,
    createRateLimiter,
    authRateLimiter,
    xssProtection,
    corsOptions,
    csrfProtection
} = require("./middlewares/securityMiddleware");

// Routes Import
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const jobRoutes = require("./routes/jobRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const savedJobsRoutes = require("./routes/savedJobRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const adminRoutes = require("./routes/adminRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

// Connect Database
connectDB();

// Security Middleware - Apply in order
app.use(helmetConfig); // Security headers
app.use(cors(corsOptions)); // CORS

// RATE LIMITING - DISABLED FOR DEVELOPMENT
// Commented out to prevent 429 errors during development
// app.use(createRateLimiter(15 * 60 * 1000, 100)); // 100 requests per 15 minutes
// app.use('/api/auth/login', authRateLimiter);
// app.use('/api/auth/register', authRateLimiter);

// Parse JSON with limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// XSS Protection
app.use(xssProtection);

// CSRF Protection (optional - enable for production)
// app.use(csrfProtection);

// Routes Setup
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/saved-jobs", savedJobsRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);

// Debug: Log all registered routes
console.log("Admin routes registered at /api/admin");
console.log("Available admin endpoints:");
console.log("  GET /api/admin/users");
console.log("  GET /api/admin/jobs");
console.log("  GET /api/admin/jobs/pending");
console.log("  PUT /api/admin/jobs/:id/approve");
console.log("  PUT /api/admin/jobs/:id/reject");
console.log("  DELETE /api/admin/jobs/:id");
console.log("  DELETE /api/admin/users/:id");

// Serve static uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error:', err);

    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ message: 'Invalid JSON payload' });
    }

    res.status(err.status || 500).json({
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Start Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('Rate Limiting: DISABLED (development mode)');
});