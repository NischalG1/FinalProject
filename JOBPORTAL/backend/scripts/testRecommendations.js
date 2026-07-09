// backend/scripts/testRecommendations.js
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Job = require("../models/Jobs");
const Application = require("../models/Application");
const SavedJob = require("../models/SavedJobs");
const RecommenderService = require("../services/recommendation/RecommenderService");
const connectDB = require("../config/db");

// Connect to database
connectDB();

const testRecommendations = async () => {
    try {
        console.log("🧪 Testing Recommendation System...\n");

        // 1. Find a jobseeker user
        const jobseeker = await User.findOne({ role: "jobseeker" });
        if (!jobseeker) {
            console.log("❌ No jobseeker user found. Please create a jobseeker account first.");
            process.exit(1);
        }

        console.log(`✅ Found jobseeker: ${jobseeker.name} (${jobseeker.email})`);
        console.log(`📊 Profile Data:`);
        console.log(`   - Skills: ${jobseeker.skills?.join(', ') || 'Not set'}`);
        console.log(`   - Preferred Category: ${jobseeker.preferredCategory || 'Not set'}`);
        console.log(`   - Preferred Location: ${jobseeker.preferredLocation || 'Not set'}`);
        console.log(`   - Experience Level: ${jobseeker.experienceLevel || 'Not set'}`);
        console.log(`   - Salary Range: ${jobseeker.expectedSalaryMin || 0} - ${jobseeker.expectedSalaryMax || 0}\n`);

        // 2. Check if user has enough profile data
        const hasProfileData = 
            (jobseeker.skills && jobseeker.skills.length > 0) ||
            jobseeker.preferredCategory || 
            jobseeker.preferredJobType || 
            jobseeker.preferredLocation || 
            jobseeker.experienceLevel;

        if (!hasProfileData) {
            console.log("⚠️  User profile is incomplete. Please update profile first.");
            console.log("   Recommendation system needs skills and preferences to work.");
            process.exit(1);
        }

        // 3. Test Hybrid Recommendations
        console.log("🔄 Testing Hybrid Recommendations...");
        const hybridStart = Date.now();
        const hybridResults = await RecommenderService.getHybridRecommendations(
            jobseeker._id,
            10
        );
        const hybridTime = Date.now() - hybridStart;

        console.log(`✅ Got ${hybridResults.length} recommendations (${hybridTime}ms)`);
        
        if (hybridResults.length > 0) {
            console.log("\n📋 Top Recommendations:");
            hybridResults.slice(0, 5).forEach((item, index) => {
                const job = item.job;
                const score = Math.round(item.score * 100);
                console.log(`   ${index + 1}. ${job.title} - ${job.company?.companyName || job.company?.name || 'Unknown Company'}`);
                console.log(`      Score: ${score}% | Location: ${job.location || 'Any'}`);
                console.log(`      Match Details:`);
                if (item.matchDetails) {
                    console.log(`      - Skills: ${item.matchDetails.skillMatch}%`);
                    console.log(`      - Experience: ${item.matchDetails.experienceMatch}%`);
                    console.log(`      - Location: ${item.matchDetails.locationMatch}%`);
                    console.log(`      - Salary: ${item.matchDetails.salaryMatch}%`);
                }
                console.log();
            });
        } else {
            console.log("   No recommendations found. This could mean:");
            console.log("   1. No jobs match your profile");
            console.log("   2. You've already applied to all matching jobs");
            console.log("   3. No approved jobs are available");
        }

        // 4. Test Collaborative Recommendations
        console.log("\n🔄 Testing Collaborative Recommendations...");
        const collabStart = Date.now();
        const collabResults = await RecommenderService.getCollaborativeRecommendations(
            jobseeker._id,
            5
        );
        const collabTime = Date.now() - collabStart;

        console.log(`✅ Got ${collabResults.length} collaborative recommendations (${collabTime}ms)`);

        if (collabResults.length > 0) {
            console.log("\n📋 Collaborative Recommendations:");
            collabResults.slice(0, 5).forEach((item, index) => {
                const job = item.job;
                const score = Math.round(item.score * 100);
                console.log(`   ${index + 1}. ${job.title} - ${job.company?.companyName || job.company?.name || 'Unknown Company'}`);
                console.log(`      Score: ${score}% | Location: ${job.location || 'Any'}`);
                console.log();
            });
        }

        // 5. Test Skill Match Calculation
        console.log("\n🔄 Testing Skill Match Calculation...");
        const testJob = await Job.findOne({ 
            status: "approved", 
            isClosed: false 
        }).populate("company", "name companyName");

        if (testJob) {
            const skillMatch = RecommenderService.calculateSkillMatch(
                jobseeker.skills || [],
                testJob.skills || []
            );
            console.log(`✅ Skill match with "${testJob.title}": ${Math.round(skillMatch * 100)}%`);
        } else {
            console.log("⚠️  No job found to test skill matching");
        }

        // 6. Statistics
        console.log("\n📊 Summary:");
        console.log(`   - User ID: ${jobseeker._id}`);
        console.log(`   - User Role: ${jobseeker.role}`);
        console.log(`   - Profile Complete: ${hasProfileData ? 'Yes ✅' : 'No ❌'}`);
        console.log(`   - Hybrid Recommendations: ${hybridResults.length}`);
        console.log(`   - Collaborative Recommendations: ${collabResults.length}`);
        console.log(`   - Total Jobs in Database: ${await Job.countDocuments({ status: "approved" })}`);
        console.log(`   - User's Applications: ${await Application.countDocuments({ applicant: jobseeker._id })}`);
        console.log(`   - User's Saved Jobs: ${await SavedJob.countDocuments({ jobseeker: jobseeker._id })}`);

        console.log("\n✨ Recommendation System Test Complete!");
        process.exit(0);

    } catch (error) {
        console.error("❌ Error testing recommendations:", error);
        process.exit(1);
    }
};

// Run the test
testRecommendations();