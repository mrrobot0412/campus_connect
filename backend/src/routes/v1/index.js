
const express = require("express");
const router = express.Router();
const otpRoutes = require("./otpRoutes");
const loginRoutes = require("./loginRoutes");
const teachersRoutes = require("./teachersRoutes");
const slotsRoutes = require("./slotsRoutes");
router.use("/otp", otpRoutes);
router.use("/loginRoutes", loginRoutes);
router.use("/teachersRoutes", teachersRoutes);
router.use("/slotsRoutes", slotsRoutes);

module.exports = router;
