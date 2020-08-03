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




//validate jwt
io.use(auth.auth);

io.on('connection', (socket) => {
  const socketId = socket.decodedToken.id;
  const ns = socket.handshake.query.ns;

  console.log('a user connected to socket: ' + socketId);
  console.log(socket.handshake.query.ns);

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


// adminIo.use(auth.auth);

// adminIo.on("connection", (socket) => {
//   const socketId = socket.decodedToken.id;
//   // cache the socket
//   redisClient.set(socketId + redisNsp.admin, socket.id);
//   socket.on("disconnect", () => {
//     console.log('admin left the socket: ');
//     //remove user from room
//     redisClient.del(socketId + redisNsp.admin);
//   });

//   //check if admin has message
//   redisClient.get(socketId + redisNsp.adminOffline, (err, result) => {
//     if (err) return console.log(err);
//     if (result) {
//       console.log('found offline message: for admin');
//       //send the message to the user
//       socket.emit("message", result);
//       //delete cached message
//       redisClient.del(socketId + redisNsp.adminOffline);
//     }
//   });
// });


server.listen(process.env.SERVER_PORT, () => {
  console.log(`server is listening in ${process.env.SERVER_PORT}`);
})
module.exports = { io, adminIo };
