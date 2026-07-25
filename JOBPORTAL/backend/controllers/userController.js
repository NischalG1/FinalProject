const fs = require('fs');
const path = require('path');
const User = require("../models/User");
const { createNotification } = require("./notificationController");

// @desc    Update user profile (name, avatar, company details)
exports.updateProfile = async (req, res) => {
    try {
        const { 
            name, 
            avatar,
            phone, 
            companyName, 
            companyDescription, 
            companyLogo, 
            companyWebsite,
            companyLocation,
            companyPhone,
            companySize,
            industry,
            foundedYear,
            resume,
            skills, 
            preferredCategory, 
            preferredJobType, 
            preferredLocation,
            experienceLevel, 
            expectedSalaryMin, 
            expectedSalaryMax,
            bio,
            title
        } = req.body;
        if (phone !== undefined) user.phone = phone;

        
        console.log('📝 Received update data:', JSON.stringify(req.body, null, 2));

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });

        console.log('👤 Current user role:', user.role);

        // Common fields for all users
        if (name !== undefined) user.name = name;
        if (avatar !== undefined) user.avatar = avatar;
        if (resume !== undefined) user.resume = resume;
        if (bio !== undefined) user.bio = bio;
        if (title !== undefined) user.title = title;

        // If employer, allow updating company info
        if (user.role === "employer") {
            if (companyName !== undefined) user.companyName = companyName;
            if (companyDescription !== undefined) user.companyDescription = companyDescription;
            if (companyLogo !== undefined) user.companyLogo = companyLogo;
            if (companyWebsite !== undefined) user.companyWebsite = companyWebsite;
            if (companyLocation !== undefined) user.companyLocation = companyLocation;
            if (companyPhone !== undefined) user.companyPhone = companyPhone;
            if (companySize !== undefined) user.companySize = companySize;
            if (industry !== undefined) user.industry = industry;
            if (foundedYear !== undefined) user.foundedYear = foundedYear;
        }

        // If jobseeker, allow updating recommendation profile fields
        if (user.role === "jobseeker") {
            if (skills !== undefined) user.skills = skills;
            if (preferredCategory !== undefined) user.preferredCategory = preferredCategory;
            if (preferredJobType !== undefined) user.preferredJobType = preferredJobType;
            if (preferredLocation !== undefined) user.preferredLocation = preferredLocation;
            if (experienceLevel !== undefined) user.experienceLevel = experienceLevel;
            if (expectedSalaryMin !== undefined) user.expectedSalaryMin = expectedSalaryMin;
            if (expectedSalaryMax !== undefined) user.expectedSalaryMax = expectedSalaryMax;
        }

        await user.save();
        console.log('💾 User saved successfully');

        // Fetch the updated user to ensure we have all fields
        const updatedUser = await User.findById(user._id).select("-password");

        // Return ALL user data
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            avatar: updatedUser.avatar,
            role: updatedUser.role,
            // Employer fields
            companyName: updatedUser.companyName || '',
            companyDescription: updatedUser.companyDescription || '',
            companyLogo: updatedUser.companyLogo || '',
            companyWebsite: updatedUser.companyWebsite || '',
            companyLocation: updatedUser.companyLocation || '',
            companyPhone: updatedUser.companyPhone || '',
            companySize: updatedUser.companySize || '',
            industry: updatedUser.industry || '',
            foundedYear: updatedUser.foundedYear || '',
            // Jobseeker fields
            resume: updatedUser.resume || '',
            skills: updatedUser.skills || [],
            preferredCategory: updatedUser.preferredCategory || '',
            preferredJobType: updatedUser.preferredJobType || '',
            preferredLocation: updatedUser.preferredLocation || '',
            experienceLevel: updatedUser.experienceLevel || '',
            expectedSalaryMin: updatedUser.expectedSalaryMin || 0,
            expectedSalaryMax: updatedUser.expectedSalaryMax || 0,
            bio: updatedUser.bio || '',
            title: updatedUser.title || '',
        });
    } catch (err) {
        console.error('❌ Update profile error:', err);
        res.status(500).json({ message: err.message });
    }
};

// @desc    Delete resume file (Jobseeker only)
exports.deleteResume = async (req, res) => {
    try {
        const { resumeUrl } = req.body;

        const fileName = resumeUrl?.split('/')?.pop();
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const filePath = path.join(__dirname, '../uploads', fileName);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        user.resume = '';
        await user.save();

        res.json({ message: "Resume deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Get user public profile
exports.getPublicProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};