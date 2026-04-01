const fs = require('fs');
const path = require('path');
const User = require("../models/User");

// @desc    Update user profile (name, avatar, company details)
exports.updateProfile = async (req, res) => {
    try {
        const { 
            name, avatar, companyName, companyDescription, companyLogo, resume,
            skills, preferredCategory, preferredJobType, preferredLocation,
            experienceLevel, expectedSalaryMin, expectedSalaryMax
        } = req.body;
        
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.name = name || user.name;
        user.avatar = avatar || user.avatar;
        if (resume !== undefined) user.resume = resume;

        // If employer, allow updating company info
        if (user.role === "employer") {
            user.companyName = companyName || user.companyName;
            user.companyDescription = companyDescription || user.companyDescription;
            user.companyLogo = companyLogo || user.companyLogo;
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

        res.json({
            _id: user._id,
            name: user.name,
            avatar: user.avatar,
            role: user.role,
            companyName: user.companyName,
            companyDescription: user.companyDescription,
            companyLogo: user.companyLogo,
            resume: user.resume || '',
            skills: user.skills || [],
            preferredCategory: user.preferredCategory || '',
            preferredJobType: user.preferredJobType || '',
            preferredLocation: user.preferredLocation || '',
            experienceLevel: user.experienceLevel || '',
            expectedSalaryMin: user.expectedSalaryMin || 0,
            expectedSalaryMax: user.expectedSalaryMax || 0,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Delete resume file (Jobseeker only)
exports.deleteResume = async (req, res) => {
    try {
        const { resumeUrl } = req.body; // expect resumeUrl to be the URL of the resume

        // Extract file name from the URL
        const fileName = resumeUrl?.split('/')?.pop();

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Construct the full file path
        const filePath = path.join(__dirname, '../uploads', fileName);

        // Check if the file exists and then delete
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath); // Delete the file
        }

        // Set the user's resume to an empty string
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