// backend/scripts/seedTestData.js
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Job = require("../models/Jobs");
const connectDB = require("../config/db");

// Connect to database
connectDB();

const seedTestData = async () => {
    try {
        console.log("🌱 Seeding Test Data...\n");

        // 1. Create a test jobseeker if none exists
        let jobseeker = await User.findOne({ email: "test@jobseeker.com" });
        if (!jobseeker) {
            console.log("Creating test jobseeker...");
            jobseeker = await User.create({
                name: "Test Jobseeker",
                email: "test@jobseeker.com",
                password: "Test123#",
                role: "jobseeker",
                skills: ["JavaScript", "React", "Node.js", "MongoDB", "Express"],
                preferredCategory: "Technology",
                preferredJobType: "Full-Time",
                preferredLocation: "New York",
                experienceLevel: "Mid",
                expectedSalaryMin: 70000,
                expectedSalaryMax: 100000
            });
            console.log("✅ Test jobseeker created!");
        } else {
            console.log("✅ Test jobseeker already exists");
        }

        // 2. Create test jobs if none exist
        const jobCount = await Job.countDocuments({ company: jobseeker._id });
        if (jobCount === 0) {
            console.log("Creating test jobs...");
            
            const testJobs = [
                {
                    title: "Senior Full Stack Developer",
                    description: "We are looking for an experienced full stack developer...",
                    requirements: "5+ years of experience, strong in React and Node.js...",
                    skills: ["JavaScript", "React", "Node.js", "MongoDB", "TypeScript"],
                    location: "New York",
                    category: "Technology",
                    type: "Full-Time",
                    company: jobseeker._id,
                    salaryMin: 90000,
                    salaryMax: 120000,
                    status: "approved"
                },
                {
                    title: "Frontend Developer",
                    description: "Join our team as a frontend developer...",
                    requirements: "3+ years of experience with React...",
                    skills: ["JavaScript", "React", "HTML", "CSS", "Redux"],
                    location: "Remote",
                    category: "Technology",
                    type: "Remote",
                    company: jobseeker._id,
                    salaryMin: 75000,
                    salaryMax: 95000,
                    status: "approved"
                },
                {
                    title: "Backend Developer - Node.js",
                    description: "We're looking for a backend developer...",
                    requirements: "4+ years of experience with Node.js...",
                    skills: ["Node.js", "Express", "MongoDB", "REST API", "Microservices"],
                    location: "San Francisco",
                    category: "Technology",
                    type: "Full-Time",
                    company: jobseeker._id,
                    salaryMin: 85000,
                    salaryMax: 110000,
                    status: "approved"
                },
                {
                    title: "DevOps Engineer",
                    description: "Looking for a DevOps engineer to manage our infrastructure...",
                    requirements: "3+ years of DevOps experience...",
                    skills: ["Docker", "Kubernetes", "AWS", "Jenkins", "Linux"],
                    location: "New York",
                    category: "Technology",
                    type: "Full-Time",
                    company: jobseeker._id,
                    salaryMin: 80000,
                    salaryMax: 105000,
                    status: "approved"
                },
                {
                    title: "Data Scientist",
                    description: "We need a data scientist to analyze our data...",
                    requirements: "4+ years of experience in data science...",
                    skills: ["Python", "Machine Learning", "SQL", "Data Analysis", "Statistics"],
                    location: "Boston",
                    category: "Data Science",
                    type: "Full-Time",
                    company: jobseeker._id,
                    salaryMin: 95000,
                    salaryMax: 130000,
                    status: "approved"
                }
            ];

            for (const jobData of testJobs) {
                await Job.create(jobData);
            }
            console.log("✅ Test jobs created!");
        } else {
            console.log(`✅ ${jobCount} test jobs already exist`);
        }

        console.log("\n📊 Test Data Summary:");
        console.log(`   - Jobseeker: ${jobseeker.name} (${jobseeker.email})`);
        console.log(`   - Skills: ${jobseeker.skills.join(', ')}`);
        console.log(`   - Jobs available: ${await Job.countDocuments({ status: "approved" })}`);
        console.log(`   - Jobs with pending status: ${await Job.countDocuments({ status: "pending" })}`);

        console.log("\n✨ Test data seeding complete!");
        console.log("\n🔑 Login credentials:");
        console.log(`   Email: ${jobseeker.email}`);
        console.log(`   Password: Test123#`);

        process.exit(0);

    } catch (error) {
        console.error("❌ Error seeding test data:", error);
        process.exit(1);
    }
};

// Run the seeder
seedTestData();