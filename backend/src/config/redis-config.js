const Redis = require('ioredis');

const redisUrl = process.env.REDIS_URL;
let connection;

if (redisUrl) {
  connection = new Redis(redisUrl, {
    maxRetriesPerRequest: null, // Required for BullMQ
  });
} else {
  const redisConfig = {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
    maxRetriesPerRequest: null, // Required for BullMQ
  };
  connection = new Redis(redisConfig);
}

module.exports = connection;
