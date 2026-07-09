// backend/models/Jobs.js
const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        requirements: { type: String, required: true },
        skills: { type: [String], default: [] },
        location: { type: String },
        category: { type: String },
        type: {
            type: String,
            enum: ["Remote", "Full-Time", "Part-Time", "Internship", "Contract"],
            required: true,
        },
        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        salaryMin: { type: Number },
        salaryMax: { type: Number },
        isClosed: { type: Boolean, default: false },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
    },
    { timestamps: true }
);

// Add indexes for performance
jobSchema.index({ company: 1, status: 1 });
jobSchema.index({ isClosed: 1, status: 1 });

module.exports = mongoose.model("Job", jobSchema);