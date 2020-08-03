const redis = require('redis');
const NTypes = require('../model/notifications_type');
const subscribe = redis.createClient();
const io = require('../socket/io').io;
const adminIo = require('../socket/io').adminIo;
const async = require('async');
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
    //save s2s message for offline users
    const messageKey = uuidv4();
    redisClient.set(messageKey, message, 'EX', process.env.MESSAGE_EXPIRES);
    //handle online user s2a
    s2a(message, messageKey, process.env.MESSAGE_EXPIRES);



    //save in S2aOffline
    //check for another s2a
    redisClient.get(redisNsp.s2a, (err, allKeys) => {
      if (allKeys) {
        redisClient.set(redisNsp.s2a, loadash.toString((loadash.concat(allKeys, messageKey))));
      } else {
        redisClient.set(redisNsp.s2a, messageKey);
      }
    })
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

      const messageKey = uuidv4();
      redisClient.set(messageKey, message, 'EX', process.env.MESSAGE_EXPIRES);
      redisClient.rpush(to + redisNsp.offline, messageKey);

    }
  });
}


const s2a = (message, uuid, ex) => {

  let cursor = 0;
  async.doWhilst((cb) => {

    redisClient.scan(cursor, "match", "*" + redisNsp.id, (err, foundedIds) => {
      if (foundedIds) {
        async.concat(foundedIds[1], (id, callback) => {
          redisClient.get(id, (err, sId) => {
            if (sId) {
              //check if this message sended before
              redisClient.get(id.replace(redisNsp.id, redisNsp.sent), (err, sended) => {
                if (sended != "true") {
                  if (io.sockets.connected[sId]) {
                    io.to(sId).emit("message", message);
                    //save the user for prevent duplication in sending
                    redisClient.set(uuid + redisNsp.sent + "/" + id.replace(redisNsp.id, ''), true, "EX", ex);
                    callback(null, 'ok');
                  } else {
                    callback('user is offline');
                  }

                } else {
                  callback('sended before');
                }
              });
            } else {
              callback('user is offline');
            }
          });
        }, (err, result) => {
          if (result) console.log(result);
          if (err) console.log(err);
        });

        cb(null, foundedIds);
      } else {
        cb('error in scan!!');
      }
    });

  }, (foundedIds, cb) => {
    if (foundedIds[0] == "0") {
      return cb("finish searching", false);
    }
    cursor = foundedIds[0];
    cb(null, true)
  }, (err) => {
    console.log(err);
  })


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


