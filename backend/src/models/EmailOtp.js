const mongoose = require("mongoose");

const schmea = mongoose.Schema;

const EmailOtpSchema = new schmea({
  createdAt: {
    type: Date,
    default:  Date.now,
    expires: '5m' // Document will expire  after createdAt
  },
  
  email: {
    type: String,
    required: true,
  },
  OTP: {
    type: Number,
    required: true,
  },
});
const EmailOtp = mongoose.model("EmailOtp", EmailOtpSchema);
module.exports = EmailOtp;
