const redisClient = require('redis').createClient();
const redisNsp = require('../../constants/caching_names.enum');
const async = require('async');
const _ = require('lodash');
const socketEnum = require('../../constants/socket.enum');


const sendToAllOffline = (socketId, socket) => {

  redisClient.get(redisNsp.S2A, (err, allS2a) => {

    if (allS2a) {
      const allS2aArray = allS2a.split(",");

      async.concat(allS2aArray, (messageKey, cb) => {
        redisClient.ttl(messageKey, (err, ttl) => {
          if (ttl) {
            redisClient.get(messageKey, (err, messageStr) => {
              if (messageStr) {
                redisClient.get(messageKey + redisNsp.SENT + "/" + socketId, (err, sent) => {
                  if (!sent) {

                    socket.emit(socketEnum.MESSAGE, messageStr);
                    redisClient.set(messageKey + redisNsp.SENT + "/" + socketId, true, "EX", ttl);
                  }
                  cb(null, socketId);
                });
              } else {
                //message is expired
                const newS2aArray = _.pull(allS2aArray, messageKey);
                redisClient.set(redisNsp.S2A, _.toString(newS2aArray));
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

module.exports = sendToAllOffline;
