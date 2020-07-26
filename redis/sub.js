const redis = require('redis');
const NTypes = require('../model/notifications_type');
const subscribe = redis.createClient();
const redisClient = redis.createClient();
const io = require('../socket/io');

subscribe.on("message", (channel, message) => {

  console.log("message: " + message + " on channel:" + channel + " just arrives!");

  if (channel == NTypes.one) {
    //convert string to json
    const jsonMessage = JSON.parse(message);

    //check if user is online
    redisClient.get(jsonMessage.to + "/ID", (err, result) => {
      if (err) {
        console.log(err);
      }
      if (result) {
        io.to(result).emit("message", message);
      } else {
        console.log('user is offline(lets save the message!): '
          + jsonMessage.to + "/OFFLINE");

        //check if user have other offline message
        redisClient.get(jsonMessage.to + "/OFFLINE", (err, result) => {
          if (result) {
            message = message + "#SEPRATOR#" + result
          }
          // caching (user is offline)
          redisClient.set(jsonMessage.to + "/OFFLINE", message, 'EX', process.env.MESSAGE_EXPIRES);
        });

      }
    });
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


