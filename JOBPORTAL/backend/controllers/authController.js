// backend/controllers/authController.js
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { createNotification } = require("./notificationController");

// Store refresh tokens (In production, use Redis or database)
const refreshTokens = new Map();

// Generate tokens with fallback for refresh secret
const generateTokens = (id) => {
    const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    
    const accessToken = jwt.sign(
        { id }, 
        process.env.JWT_SECRET, 
        { expiresIn: "15m" }
    );
    
    const refreshToken = jwt.sign(
        { id }, 
        refreshSecret, 
        { expiresIn: "7d" }
    );
    
    return { accessToken, refreshToken };
};

// @desc Register new user
exports.register = async (req, res) => {
    try {
        const { name, email, password, avatar, role } = req.body;

        // Validate required fields
        if (!name || !email || !password || !role) {
            return res.status(400).json({ 
                message: "Please provide all required fields: name, email, password, role" 
            });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const user = await User.create({ name, email, password, role, avatar });

        const { accessToken, refreshToken } = generateTokens(user._id);
        
        // Store refresh token
        refreshTokens.set(refreshToken, { 
            userId: user._id, 
            createdAt: Date.now() 
        });

        // Create welcome notification
        try {
            await createNotification({
                recipient: user._id,
                type: "system",
                title: "Welcome to Down2Work! 🎉",
                message: `Welcome ${name}! We're excited to have you on board. Start exploring opportunities today.`,
                link: role === "employer" ? "/employer-dashboard" : "/dashboard",
                priority: "high",
                data: {
                    userId: user._id,
                    userRole: role,
                }
            });
        } catch (notificationError) {
            // Don't fail registration if notification fails
            console.error("Notification creation failed:", notificationError);
        }

        res.status(201).json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar || "",
                companyName: user.companyName || "",
                companyDescription: user.companyDescription || "",
                companyLogo: user.companyLogo || "",
                resume: user.resume || "",
                skills: user.skills || [],
                preferredCategory: user.preferredCategory || "",
                preferredJobType: user.preferredJobType || "",
                preferredLocation: user.preferredLocation || "",
                experienceLevel: user.experienceLevel || "",
                expectedSalaryMin: user.expectedSalaryMin || 0,
                expectedSalaryMax: user.expectedSalaryMax || 0,
                bio: user.bio || "",
                title: user.title || "",
            },
            accessToken,
            refreshToken,
        });
    } catch (err) {
        console.error("❌ Register error:", err);
        res.status(500).json({ 
            message: err.message || "Registration failed" 
        });
    }
};

// @desc Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                message: "Please provide email and password" 
            });
        }

        const user = await User.findOne({ email });
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const { accessToken, refreshToken } = generateTokens(user._id);
        
        // Store refresh token
        refreshTokens.set(refreshToken, { 
            userId: user._id, 
            createdAt: Date.now() 
        });

        res.json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar || "",
                companyName: user.companyName || "",
                companyDescription: user.companyDescription || "",
                companyLogo: user.companyLogo || "",
                resume: user.resume || "",
                skills: user.skills || [],
                preferredCategory: user.preferredCategory || "",
                preferredJobType: user.preferredJobType || "",
                preferredLocation: user.preferredLocation || "",
                experienceLevel: user.experienceLevel || "",
                expectedSalaryMin: user.expectedSalaryMin || 0,
                expectedSalaryMax: user.expectedSalaryMax || 0,
                bio: user.bio || "",
                title: user.title || "",
            },
            accessToken,
            refreshToken,
        });
    } catch (err) {
        console.error("❌ Login error:", err);
        res.status(500).json({ 
            message: err.message || "Login failed" 
        });
    }
};

// @desc Refresh token
exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        
        if (!refreshToken) {
            return res.status(401).json({ 
                message: "Refresh token required" 
            });
        }

        // Check if refresh token exists
        const tokenData = refreshTokens.get(refreshToken);
        if (!tokenData) {
            return res.status(403).json({ 
                message: "Invalid refresh token" 
            });
        }

        // Get refresh secret with fallback
        const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;

        // Verify refresh token
        let decoded;
        try {
            decoded = jwt.verify(refreshToken, refreshSecret);
        } catch (error) {
            // Remove invalid token
            refreshTokens.delete(refreshToken);
            
            if (error.name === 'TokenExpiredError') {
                return res.status(403).json({ 
                    message: "Refresh token expired, please login again" 
                });
            }
            return res.status(403).json({ 
                message: "Invalid refresh token" 
            });
        }

        // Check if user still exists
        const user = await User.findById(decoded.id);
        if (!user) {
            refreshTokens.delete(refreshToken);
            return res.status(404).json({ 
                message: "User not found" 
            });
        }

        // Generate new tokens
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens(user._id);
        
        // Remove old refresh token
        refreshTokens.delete(refreshToken);
        // Store new refresh token
        refreshTokens.set(newRefreshToken, { 
            userId: user._id, 
            createdAt: Date.now() 
        });

        res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        });
    } catch (error) {
        console.error("❌ Refresh token error:", error);
        res.status(500).json({ 
            message: error.message || "Failed to refresh token" 
        });
    }
};

// @desc Logout
exports.logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (refreshToken) {
            refreshTokens.delete(refreshToken);
        }
        res.json({ 
            message: "Logged out successfully" 
        });
    } catch (error) {
        console.error("❌ Logout error:", error);
        res.status(500).json({ 
            message: error.message || "Logout failed" 
        });
    }
};

// @desc Get logged-in user
exports.getMe = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Not authenticated" });
        }
        res.json(req.user);
    } catch (error) {
        console.error("❌ GetMe error:", error);
        res.status(500).json({ 
            message: error.message || "Failed to get user" 
        });
    }
};

// Cleanup expired refresh tokens periodically (every hour)
setInterval(() => {
    const now = Date.now();
    let deletedCount = 0;
    for (const [token, data] of refreshTokens) {
        // Remove tokens older than 7 days
        if (now - data.createdAt > 7 * 24 * 60 * 60 * 1000) {
            refreshTokens.delete(token);
            deletedCount++;
        }
    }
    if (deletedCount > 0) {
        console.log(`🧹 Cleaned up ${deletedCount} expired refresh tokens`);
    }
}, 60 * 60 * 1000);

// Log cleanup on server start
console.log('🔄 Refresh token cleanup scheduled (every hour)');
console.log(`📊 Current refresh tokens in memory: ${refreshTokens.size}`);