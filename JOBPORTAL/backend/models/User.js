// backend/models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { 
            type: String, 
            enum: ["jobseeker", "employer", "admin"], 
            required: true 
        },
        avatar: { type: String, default: "" },
        resume: { type: String, default: "" },
        
        // For employer
        companyName: { type: String, default: "" },
        companyDescription: { type: String, default: "" },
        companyLogo: { type: String, default: "" },
        
        // Jobseeker profile fields
        skills: { type: [String], default: [] },
        preferredCategory: { type: String, default: "" },
        preferredJobType: { type: String, default: "" },
        preferredLocation: { type: String, default: "" },
        experienceLevel: { 
            type: String, 
            enum: ["", "Entry", "Mid", "Senior", "Lead"], 
            default: "" 
        },
        expectedSalaryMin: { type: Number, default: 0 },
        expectedSalaryMax: { type: Number, default: 0 },
    },
    { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
        throw new Error(`Password hashing failed: ${error.message}`);
    }
});

// Match entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
    try {
        return await bcrypt.compare(enteredPassword, this.password);
    } catch (error) {
        throw new Error(`Password comparison failed: ${error.message}`);
    }
};

module.exports = mongoose.model("User", userSchema);