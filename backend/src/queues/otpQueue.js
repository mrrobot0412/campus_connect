const { Queue } = require('bullmq');
const connection = require('../config/redis-config');

const otpQueue = new Queue('otp-queue', { connection });

const addOtpToQueue = async (data) => {
  await otpQueue.add('send-otp', data, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  });
};

module.exports = { addOtpToQueue };
