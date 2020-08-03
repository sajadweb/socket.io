const redisClient = require('redis').createClient();
const redisNsp = require('../redis/namespace');
const async = require('async');


const oneToMultiOffline = (socketId, socket) => {
  async.forever((next) => {
    redisClient.lpop(socketId + redisNsp.multiOffline, (err, messageKey) => {
      if (messageKey) {
        redisClient.get(messageKey, (err, messageStr) => {
          if (messageStr) {
            socket.emit("message", messageStr);
            next();
          }
        });
      } else {
        next('no offline message  for: ' + socketId);
      }
    });
  }, (err) => {
    console.log(err);
  });
}

module.exports = oneToMultiOffline;
