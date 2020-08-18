var redis = require('redis');
module.exports = {
  createClient: () => {
    return redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);
  },
};
