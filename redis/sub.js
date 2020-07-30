const redis = require('redis');
const NTypes = require('../model/notifications_type');
const subscribe = redis.createClient();
const io = require('../socket/io').io;
const adminIo = require('../socket/io').adminIo;
const async = require('async');
const { promisify } = require('util');
const loadash = require('lodash');
const redisNsp = require('./namespace');
const { v4: uuidv4 } = require('uuid');

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

      redisClient.get(to + redisNsp.id, (err, sId) => {
        if (err) {
          console.log(err);
        }
        if (sId) {
          //check if really user in online?
          //usefull when server crushes
          //when server crushes and redis don't
          //the socketId will exsist in db
          //after server runs again the saved
          //socketId will refreshes in db
          if (io.sockets.connected[sId]) {
            io.to(sId).emit("message", message);
            callback(null, to);
          } else {
            callback("offline");
          }
        } else {
          console.log('user is offline: ' + "message saved for offline users!");
          callback("offline")
        }
      })
    }, (err, ids) => {
      if (err) {
        const offlineUsers = loadash.difference(jsonMessage.to, ids);

        //save the message
        const messageKey = uuidv4();
        redisClient.set(messageKey, message, 'EX', process.env.MESSAGE_EXPIRES);

        //save the offline messages
        async.concat(offlineUsers, (offlineUser) => {
          redisClient.rpush(offlineUser + redisNsp.multiOffline, messageKey)
        });

      }
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
  redisClient.get(to + redisNsp.id, (err, result) => {
    if (err) {
      console.log(err);
    }
    if (result) {
      io.to(result).emit("message", message);
    } else {
      console.log('user is offline(lets save the message!): '
        + to + redisNsp.offline);

      //check if user have other offline messages
      redisClient.get(to + redisNsp.offline, (err, result) => {
        if (result) {
          message = message + "#SEPRATOR#" + result
        }
        // caching (user is offline)
        redisClient.set(to + redisNsp.offline, message, 'EX', process.env.MESSAGE_EXPIRES);
      });

    }
  });
}


const s2a = (message) => {
  redisClient.keys("*" + redisNsp.id, (err, res) => {
    if (res) {
      // handle s2a
      for (let id of res) {
        redisClient.get(id, (err, sId) => {
          if (sId) {
            //check if this message sended before
            redisClient.get(id.replace(redisNsp.id, redisNsp.sent), (err, sended) => {

              if (sended != "true") {
                io.to(sId).emit("message", message);
                //save the user for prevent duplication in sending
                redisClient.set(id.replace(redisNsp.id, redisNsp.sent), true,);
              }
            });

          }
        })
      }
    }
  });
}

const adminSubs = (to, message) => {
  redisClient.get(to + redisNsp.admin, (err, sId) => {
    if (sId) {
      adminIo.to(sId).emit("message", message);
    } else {
      //admin is offline
      redisClient.set(to + redisNsp.adminOffline, message, 'EX', process.env.MESSAGE_EXPIRES);
    }

  })
}

module.exports = subscribe;


