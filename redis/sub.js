const redis = require('redis');
const NTypes = require('../model/notifications_type');
const subscribe = redis.createClient();
const io = require('../socket/io');

subscribe.on("message", (channel, message) => {

  console.log("message: " + message + " on channel:" + channel + " just arrives!");

  //convert string to json
  const jsonMessage = JSON.parse(message);

  if (channel == NTypes.one) {
    return subs(jsonMessage.to, message);
  }
  if (channel == NTypes.multi) {
    for (let to of jsonMessage.to) {
      subs(to, message);
    }
    return;
  }
  if (channel == NTypes.all) {
    //handle online user s2a
    s2a(message);

    //save s2s message for offline users
    const redisClient = redis.createClient();
    redisClient.set("s2a", message);
    return;
  }
})


const subs = (to, message) => {
  const redisClient = redis.createClient();
  redisClient.get(to + "/ID", (err, result) => {
    if (err) {
      console.log(err);
    }
    if (result) {
      io.to(result).emit("message", message);
    } else {
      console.log('user is offline(lets save the message!): '
        + to + "/OFFLINE");

      //check if user have other offline messages
      redisClient.get(to + "/OFFLINE", (err, result) => {
        if (result) {
          message = message + "#SEPRATOR#" + result
        }
        // caching (user is offline)
        redisClient.set(to + "/OFFLINE", message, 'EX', process.env.MESSAGE_EXPIRES);
      });

    }
  });
}

const s2a = (message) => {
  const redisClient = redis.createClient();
  redisClient.keys("*" + "/ID", (err, res) => {
    if (res) {
      // handle s2a
      for (let id of res) {
        redisClient.get(id, (err, sId) => {
          if (sId) {
            //check if this message sended before
            redisClient.get(id.replace("/ID", "/SENT"), (err, sended) => {

              if (sended != "true") {
                io.to(sId).emit("message", message);
                //save the user for prevent duplication in sending
                redisClient.set(id.replace("/ID", "/SENT"), true,);
              }
            });

          }
        })
      }
    }
  });

}

module.exports = subscribe;


