const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Generate token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "60d" });
};

// @desc Register new user
exports.register = async (req, res) => {
  try {
    const { name, email, password, avatar, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ name, email, password, role, avatar });

    const token = generateToken(user._id);

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
      },
      token,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user._id);

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
      },
      token,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Get logged-in user
exports.getMe = async (req, res) => {
  res.json(req.user); //
};



