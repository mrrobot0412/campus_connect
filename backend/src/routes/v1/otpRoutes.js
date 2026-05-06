var jwt = require("jsonwebtoken");
const EmailOtp = require("../../models/EmailOtp");
const otpAuth = require("../../middlewares/otpMiddleware");
const { body, validationResult } = require("express-validator");
const { addOtpToQueue } = require("../../queues/otpQueue");
const { JWT_SECRET } = require("../../config/server-config");
const { otpLimiter } = require("../../middlewares/rateLimiter");

const express = require("express");
const router = express.Router();

router.post(
  "/generateOTP",
  otpLimiter,
  [
    body("email").isEmail().withMessage("Invalid email format")
      .matches(/^[a-zA-Z0-9._%+-]+@thapar\.edu$/).withMessage("Email must be from thapar.edu domain"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email } = req.body;
      const digits = "0123456789";
      let otp = "";
      for (let i = 0; i < 6; i++) {
        otp += digits[Math.floor(Math.random() * 10)];
      }

      const user = await EmailOtp.findOne({ email: email });

      if (!user) {
        await EmailOtp.create({ email: email, OTP: otp });
      } else {
        const thirtySecondsAgo = Date.now() - 30000;
        if (user.createdAt.getTime() > thirtySecondsAgo) {
          return res.status(400).json({ message: "Please wait 30 seconds before requesting a new OTP" });
        }
        await EmailOtp.findByIdAndUpdate(user._id, { OTP: otp, createdAt: new Date() });
      }

      // Add to background queue instead of waiting for SMTP
      await addOtpToQueue({ email, otp });

      const data = { user: { email: email } };
      // OTP verification token is short-lived and only proves email ownership.
      const authtoken = jwt.sign(data, JWT_SECRET, { expiresIn: "10m" });
      return res.status(200).json({ authtoken: authtoken });
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.post("/verifyotp", otpLimiter, otpAuth, [
  body("otp", "Otp cannot be blank").exists(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { otp } = req.body;
    const email = req.user.email;

    const user = await EmailOtp.findOne({ email: email, OTP: otp });

    if (!user) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    await EmailOtp.findByIdAndDelete(user._id);

    const data = { email: email, verified: true };
    // Registration token is short-lived after OTP succeeds.
    const authtoken = jwt.sign(data, JWT_SECRET, { expiresIn: "15m" });
    return res.status(200).json({ authtoken: authtoken });
  } catch (error) {
    return res.status(400).json({ error: "Server error" });
  }
});

module.exports = router;
