const cacheSockets = require('./cache_sockets');
const sendToOneOffline = require('./send_to_one_offline');
const sendToMultiOffline = require('./send_to_multi_offline');
const sendToAllOffline = require('./send_to_all_offline');
const redisNsp = require('../../constants/caching_names.enum');
const socketEnum = require('../../constants/socket.enum');
const onlineUsers = require('../pubsub/online_users');
const sendToNamespaceOffline = require('./send_to_namespace_offline');

exports.onConnection = (socket) => {
  const socketId = socket.decodedToken.id;
  const ns = socket.handshake.query.ns;

  console.log('a user connected to socket: ' + socketId);
  console.log(socket.handshake.query.ns);

  // list of online users
  socket.on(socketEnum.GET, (body) => {
    if (body === socketEnum.ALL_ONLINE) {
      return onlineUsers(socket);
    }
  });

  // cache the socket
  if (ns) {
    cacheSockets(socketId + redisNsp.NAMESPACE + ns, socket);
    sendToNamespaceOffline(socketId + redisNsp.NAMESPACE + ns, socket);
  } else {
    cacheSockets(socketId, socket);
  }

  //check if user have message ?
  sendToOneOffline(socketId, socket);

  //check for multi messages
  sendToMultiOffline(socketId, socket);

  //check if use have s2a message
  sendToAllOffline(socketId, socket);

}


