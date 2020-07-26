const redis = require("redis");
const NTypes = require('../model/notifications_type');
const subscribe = redis.createClient();
const redisClient = redis.createClient();

subscribe.on("message", (channel, message) => {
  console.log("message: " + message + " on channel:" + channel + " just arrives!");
  if (channel == NTypes.one) {
    //convert string to json
    const jsonMessage = JSON.parse(message);

    //caching
    redisClient.set(jsonMessage.to, message, 'EX', process.env.MESSAGE_EXPIRES);
    return;
  }
  if (channel == NTypes.multi) {

    return;
  }
  if (channel == NTypes.all) {

    return;
  }
})

module.exports = subscribe;


