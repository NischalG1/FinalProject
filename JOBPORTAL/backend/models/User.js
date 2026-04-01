// const mongoose = require("mongoose");
// const bcrypt = require("bcryptjs");

// const userSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     role: { type: String, enum: ["jobseeker", "employer"], required: true },
//     avatar: String,
//     resume: String,

//     // for employer
//     companyName: String,
//     companyDescription: String,
//     companyLogo: String,
//   },
//   { timestamps: true }
// );

// userSchema.pre("save", function (next) {
//   if (!this.isModified("password")) return next();

//   bcrypt.hash(this.password, 10, (err, hash) => {
//     if (err) return next(err);

//     this.password = hash;
//     next();
//   });
// });

// //Match entered password
// userSchema.methods.matchPassword = function (enteredPassword) {
//   return bcrypt.compare(enteredPassword, this.password);
// };

// module.exports = mongoose.model("User", userSchema);


const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true 
    },
    email: { 
      type: String, 
      required: true, 
      unique: true,
      lowercase: true,
      trim: true
    },
    password: { 
      type: String, 
      required: true 
    },
    role: { 
      type: String, 
      enum: ["jobseeker", "employer", "admin"], 
      required: true 
    },
    avatar: {
      type: String,
      default: ""
    },
    resume: {
      type: String,
      default: ""
    },

    // For employer
    companyName: {
      type: String,
      default: ""
    },
    companyDescription: {
      type: String,
      default: ""
    },
    companyLogo: {
      type: String,
      default: ""
    },

    // Jobseeker profile fields for recommendation engine
    skills: {
      type: [String],
      default: []
    },
    preferredCategory: {
      type: String,
      default: ""
    },
    preferredJobType: {
      type: String,
      default: ""
    },
    preferredLocation: {
      type: String,
      default: ""
    },
    experienceLevel: {
      type: String,
      enum: ["", "Entry", "Mid", "Senior", "Lead"],
      default: ""
    },
    expectedSalaryMin: {
      type: Number,
      default: 0
    },
    expectedSalaryMax: {
      type: Number,
      default: 0
    },
  },
  { 
    timestamps: true 
  }
);

// Hash password before saving - using async/await (no next needed)
userSchema.pre("save", async function () {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) return;

  try {
    // Generate salt and hash password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw new Error(`Password hashing failed: ${error.message}`);
  }
});

// Method to compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    throw new Error(`Password comparison failed: ${error.message}`);
  }
};

// Method to get user without password
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model("User", userSchema);