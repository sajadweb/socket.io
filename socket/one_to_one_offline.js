const redisClient = require('redis').createClient();
const redisNsp = require('../redis/namespace');
const async = require('async');

const oneToOneOffline = (socketId, socket) => {
  async.forever((next) => {
    redisClient.lpop(socketId + redisNsp.offline, (err, messageKey) => {
      if (err) return console.log(err);
      if (messageKey) {
        redisClient.get(messageKey, (err, message) => {
          if (message) {
            console.log('found offline message');
            socket.emit("message", message);
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

module.exports = oneToOneOffline;
