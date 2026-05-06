
const express = require("express");
const router = express.Router();
const otpRoutes = require("./otpRoutes");
const loginRoutes = require("./loginRoutes");
const teachersRoutes = require("./teachersRoutes");
const slotsRoutes = require("./slotsRoutes");
router.use("/otp", otpRoutes);
router.use("/loginRoutes", loginRoutes);
router.use("/teachersRoutes", teachersRoutes);
// Primary slot API path used by the frontend.
router.use("/slots", slotsRoutes);
// Temporary alias keeps older clients working during route cleanup.
router.use("/slotsRoutes", slotsRoutes);

module.exports = router;
