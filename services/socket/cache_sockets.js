const redisClient = require('../../util/redis').createClient();
const redisNsp = require('../../constants/caching_names.enum');
const socketEnum = require('../../constants/socket.enum');

const cacheSockets = (socketId, socket) => {
  // cache the socket
  redisClient.set(socketId + redisNsp.ID, socket.id);
  socket.on(socketEnum.DISCONNECT, () => {
    //remove user from room
    redisClient.del(socketId + redisNsp.ID);
  });
}

module.exports = cacheSockets;
