const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const adminIo = require('socket.io')(server, { path: '/admin' });
const auth = require('../controller/auth');
const cacheSockets = require('./cache_sockets');
const oneToOneOffline = require('./one_to_one_offline');
const oneToMultiOffline = require('./one_to_multi_offline');
const oneToAllOffline = require('./one_to_all_offline');
const redisNsp = require('../redis/namespace');
const onlineUsers = require('../redis/online_users');



//validate jwt
io.use(auth.auth);

io.on('connection', (socket) => {
  const socketId = socket.decodedToken.id;
  const ns = socket.handshake.query.ns;

  // console.log('a user connected to socket: ' + socketId);
  // console.log(socket.handshake.query.ns);

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

});


server.listen(process.env.SERVER_PORT, () => {
  console.log(`server is listening in ${process.env.SERVER_PORT}`);
})
module.exports = { io, adminIo };
