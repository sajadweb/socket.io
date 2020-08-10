const redisClient = require('redis').createClient();
const redisNsp = require('../../constants/caching_names.enum');
const async = require('async');
const socketEnum = require('../../constants/socket.enum');

const sendToMultiOffline = (socketId, socket) => {
  async.forever((next) => {
    redisClient.lpop(socketId + redisNsp.MULTI_OFFLINE, (err, messageKey) => {
      if (messageKey) {
        redisClient.get(messageKey, (err, messageStr) => {
          if (messageStr) {
            socket.emit(socketEnum.MESSAGE, messageStr);
            next();
          }
        });
      } else {
        next('no offline message  for: ' + socketId);
      }
    });
  }, (err) => {
    // console.log(err);
  });
}

module.exports = sendToMultiOffline;
