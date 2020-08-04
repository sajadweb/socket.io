const redisClient = require('redis').createClient();
const redisNsp = require('../redis/namespace');

const cacheSockets = (socketId, socket) => {
  // cache the socket
  redisClient.set(socketId + redisNsp.id, socket.id);
  socket.on("disconnect", () => {
    //remove user from room
    redisClient.del(socketId + redisNsp.id);
  });
}

module.exports = cacheSockets;
