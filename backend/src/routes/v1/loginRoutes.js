const express = require("express");
const loginAuth = require("../../middlewares/authMiddleware");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
const Student = require("../../models/student")
const { JWT_SECRET } = require("../../config/server-config");
const Teacher = require("../../models/teachers");
const { loginLimiter } = require("../../middlewares/rateLimiter");
const { sendPasswordResetEmail } = require("../../utils/otpHelper");
const PasswordReset = require("../../models/PasswordReset");
const crypto = require("crypto");

router.post(
  "/registerStudent",
  [
    body("firstName")
      .isString()
      .notEmpty()
      .withMessage("First name is required"),
    body("lastName").isString().notEmpty().withMessage("Last name is required"),
    body("roll")
      .isNumeric()
      .withMessage("Roll number is required and must be a number"),
    body("password").isString().notEmpty().withMessage("Password is required"),
  ],
  loginAuth,
  async function name(req, res) {
    console.log(req.user.verified);
    if (req.user.verified != true) {
      return res.status(401).json({ message: "Email is not verified" });
    }
    const finduser = await Student.findOne({ email: req.user.email });

    if (finduser) {
      return res.status(400).json({ message: "user already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password, salt);
    const userData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.user.email, // Optional
      roll: req.body.roll,
      password: secPass,
    };

    try {
      const user = new Student(userData);
      await user.save();
      return res.status(200).json({ message: "succesfuly registered" });
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.post("/studentLogin", loginLimiter, async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email or roll
    const user = await Student.findOne({ email: email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Compare hashed passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "12h" }
    );

    return res.json({ message: "Login successful", token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Get Student Profile
router.get("/student/profile", loginAuth, async (req, res) => {
  try {
    const student = await Student.findOne({ email: req.user.email }).select(
      "-password"
    ); // Exclude password

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    return res.json({ student });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});



router.post("/teacherLogin", loginLimiter, async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email or roll
    const user = await Teacher.findOne({ email: email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Compare hashed passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "12h" }
    );

    return res.json({ message: "Login successful", token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});



  
// Forgot Password - Generate reset token and send email
router.post("/forgotPassword", loginLimiter, [
  body("email").isEmail().withMessage("Valid email is required"),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email } = req.body;

  try {
    // Check if user exists (student or teacher)
    const student = await Student.findOne({ email });
    const teacher = await Teacher.findOne({ email });
    const user = student || teacher;

    if (!user) {
      // Don't reveal whether email exists - return success anyway
      return res.status(200).json({ message: "If that email exists, a reset link has been sent." });
    }

    // Delete any existing reset tokens for this email
    await PasswordReset.deleteMany({ email });

    // Generate reset token (32 bytes, hex encoded = 64 chars)
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash the token for storage
    const tokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Store hashed token in DB
    await PasswordReset.create({ email, tokenHash });

    // Get frontend URL from env (with fallback for dev)
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    // Send email with reset link containing raw token
    const emailSent = await sendPasswordResetEmail({ email, resetToken, frontendUrl }).catch(err => {
      console.error("Failed to send password reset email:", err);
      return false;
    });

    if (!emailSent) {
      // Email failed but don't reveal to user (security)
      console.warn(`Password reset email failed for ${email} - token still created`);
    }

    return res.status(200).json({ message: "If that email exists, a reset link has been sent." });
  } catch (err) {
    console.error("Error in forgotPassword:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Reset Password - Verify token and update password
router.post("/resetPassword", [
  body("token").notEmpty().withMessage("Reset token is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { token, password } = req.body;

  try {
    // Hash the incoming token to compare with stored hash
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    // Find the reset record
    const resetRecord = await PasswordReset.findOne({ tokenHash });
    if (!resetRecord) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    // Find the user by email
    const student = await Student.findOne({ email: resetRecord.email });
    const teacher = await Teacher.findOne({ email: resetRecord.email });
    const user = student || teacher;

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    // Hash new password and update
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user.password = hashedPassword;
    await user.save();

    // Delete the reset token (one-time use)
    await PasswordReset.deleteOne({ _id: resetRecord._id });

    return res.status(200).json({ message: "Password reset successfully. You can now login." });
  } catch (err) {
    console.error("Error in resetPassword:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
