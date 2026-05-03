const { Worker } = require('bullmq');
const connection = require('../config/redis-config');
const { sendOtp } = require('../utils/otpHelper');

const otpWorker = new Worker(
  'otp-queue',
  async (job) => {
    console.log(`Processing OTP job for ${job.data.email}...`);
    const { email, otp } = job.data;
    const isSent = await sendOtp({ email, otp });
    
    if (!isSent) {
      throw new Error(`Failed to send OTP to ${email}`);
    }
    
    console.log(`Successfully sent OTP to ${email}`);
  },
  { connection }
);

otpWorker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed: ${err.message}`);
});

otpWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

module.exports = otpWorker;
