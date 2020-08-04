const cacheSockets = require('./cache_sockets');
const oneToOneOffline = require('./one_to_one_offline');
const oneToMultiOffline = require('./one_to_multi_offline');
const oneToAllOffline = require('./one_to_all_offline');
const redisNsp = require('../redis/namespace');
const onlineUsers = require('../redis/online_users');

exports.onConnection = (socket) => {
  const socketId = socket.decodedToken.id;
  const ns = socket.handshake.query.ns;

  console.log('a user connected to socket: ' + socketId);
  console.log(socket.handshake.query.ns);

  // list of online users
  socket.on("get", (body) => {
    switch (body) {
      case "all:online":
        onlineUsers(socket);
        break;
    }
  });

  // cache the socket
  if (ns) {
    cacheSockets(socketId + redisNsp.namespace + ns, socket);
  } else {
    cacheSockets(socketId, socket);
  }

  //check if user have message ?
  oneToOneOffline(socketId, socket);

  //check for multi messages
  oneToMultiOffline(socketId, socket);

  //check if use have s2a message
  oneToAllOffline(socketId, socket);

}


