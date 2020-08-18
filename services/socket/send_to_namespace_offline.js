const redisClient = require('../../util/redis').createClient();
const redisNsp = require('../../constants/caching_names.enum');
const async = require('async');
const _ = require('lodash');
const socketEnum = require('../../constants/socket.enum');


const sendToNamespaceOffline = (socketId, socket) => {

  redisClient.get(redisNsp.NAMESPACE_OFFLINE, (err, allOfflineNS) => {

    if (allOfflineNS) {
      const allNSArray = allOfflineNS.split(",");

      async.concat(allNSArray, (messageKey, cb) => {
        redisClient.ttl(messageKey, (err, ttl) => {
          if (ttl) {
            redisClient.get(messageKey, (err, messageStr) => {
              if (messageStr) {
                redisClient.get(messageKey + redisNsp.SENT + "/" + socketId, (err, sent) => {
                  if (!sent) {

                    socket.emit(socketEnum.MESSAGE, messageStr);
                    redisClient.set(messageKey + redisNsp.SENT + "/" + socketId, true, redisNsp.EX, ttl);
                  }
                  cb(null, socketId);
                });
              } else {
                //message is expired
                const newNSArray = _.pull(allNSArray, messageKey);
                redisClient.set(redisNsp.S2A, _.toString(newNSArray));
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

module.exports = sendToNamespaceOffline;
