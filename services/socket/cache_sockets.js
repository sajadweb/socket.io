const redisClient = require('redis').createClient();
const redisNsp = require('../../constants/caching_names.enum');

const cacheSockets = (socketId, socket) => {
  // cache the socket
  redisClient.set(socketId + redisNsp.ID, socket.id);
  socket.on("disconnect", () => {
    //remove user from room
    redisClient.del(socketId + redisNsp.ID);
  });
}

module.exports = cacheSockets;
