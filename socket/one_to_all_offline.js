const redisClient = require('redis').createClient();
const redisNsp = require('../redis/namespace');
const async = require('async');
const lodash = require('lodash');

const oneToAllOffline = (socketId, socket) => {

  redisClient.get(redisNsp.s2a, (err, allS2a) => {

    if (allS2a) {
      const allS2aArray = allS2a.split(",");

      async.concat(allS2aArray, (s2aUUID, cb) => {
        redisClient.ttl(s2aUUID, (err, ttl) => {
          if (ttl) {
            redisClient.get(s2aUUID, (err, messageStr) => {
              if (messageStr) {
                redisClient.get(s2aUUID + redisNsp.sent + "/" + socketId, (err, sent) => {
                  if (!sent) {

                    socket.emit("message", messageStr);
                    redisClient.set(s2aUUID + redisNsp.sent + "/" + socketId, true, "EX", ttl);
                  }
                  cb(null, socketId);
                });
              } else {
                //message is expired
                const newS2aArray = lodash.pull(allS2aArray, s2aUUID);
                redisClient.set(redisNsp.s2a, lodash.toString(newS2aArray));
                cb('expired');
              }
            })
          }
        });
      }, (err, result) => {
        // if (err) console.log(err);
        // if (result) console.log(result);
      });
    }
  });
}

module.exports = oneToAllOffline;
