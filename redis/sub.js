const redis = require('redis');
const NTypes = require('../model/notifications_type');
const subscribe = redis.createClient();
const io = require('../socket/io').io;
const adminIo = require('../socket/io').adminIo;
const async = require('async');
const { promisify } = require('util');
const loadash = require('lodash');

const redisClient = redis.createClient();

subscribe.on("message", async (channel, message) => {

  console.log("message: " + message + " on channel:" + channel + " just arrives!");

  //convert string to json
  const jsonMessage = JSON.parse(message);

  if (channel == NTypes.one) {
    return subs(jsonMessage.to, message);
  }
  if (channel == NTypes.multi) {

    async.concat(jsonMessage.to, (to, callback) => {

      redisClient.get(to + "/ID", (err, sId) => {
        if (err) {
          console.log(err);
        }
        if (sId) {
          io.to(sId).emit("message", message);
          callback(null, to);
        } else {
          console.log('user is offline: ' + "message saved for offline users!");
          callback("offline")
        }
      })
    }, (err, ids) => {

      const offlineUsers = loadash.difference(jsonMessage.to, ids);
      //reassign message users & save for offline users
      jsonMessage.to = offlineUsers;
      redisClient.set("MULTI" + "/OFFLINE", JSON.stringify(jsonMessage));
    })
    return;
  }
  if (channel == NTypes.all) {
    //handle online user s2a
    s2a(message);

    //save s2s message for offline users
    redisClient.set("s2a", message);
    return;
  }
  if (channel == NTypes.admin) {
    for (let to of jsonMessage.to) {
      adminSubs(to, message);
    }

    return;
  }
});


const subs = (to, message) => {
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

const adminSubs = (to, message) => {
  redisClient.get(to + "/ADMIN", (err, sId) => {
    if (sId) {
      adminIo.to(sId).emit("message", message);
    } else {
      //admin is offline
      redisClient.set(to + "/ADMIN/OFFLINE", message, 'EX', process.env.MESSAGE_EXPIRES);
    }

  })
}

module.exports = subscribe;


