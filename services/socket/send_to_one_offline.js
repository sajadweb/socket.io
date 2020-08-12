const redisClient = require('redis').createClient();
const redisNsp = require('../../constants/caching_names.enum');
const async = require('async');
const socketEnum = require('../../constants/socket.enum');


const sendToOneOffline = (socketId, socket) => {
  async.forever((next) => {
    redisClient.lpop(socketId + redisNsp.OFFLINE, (err, messageKey) => {
      if (err) return console.log(err);
      if (messageKey) {
        redisClient.get(messageKey, (err, message) => {
          if (message) {
            socket.emit(socketEnum.MESSAGE, message);
            redisClient.del(messageKey);
          }
        });
        next();
      } else {
        next('finish')
      }
    });
  }, (err) => {
    console.log(err);
  })
}

module.exports = sendToOneOffline;
