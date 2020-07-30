const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const adminIo = require('socket.io')(server, { path: '/admin' });
const redisClient = require('redis').createClient();
const auth = require('../controller/auth');
const redisNsp = require('../redis/namespace');
const async = require('async');

//validate jwt
io.use(auth.auth);

io.on('connection', (socket) => {
  const socketId = socket.decodedToken.id;
  console.log('a user connected to socket: ' + socketId);

  // cache the socket
  redisClient.set(socketId + redisNsp.id, socket.id);
  socket.on("disconnect", () => {
    console.log('user left the socket: ');
    //remove user from room
    redisClient.del(socketId + redisNsp.id);
  });

  //check if user have message ?
  redisClient.get(socketId + redisNsp.offline, (err, result) => {
    if (err) return console.log(err);
    if (result) {
      console.log('found offline message');
      //send the message to the user
      socket.emit("message", result);
      //delete cached message
      redisClient.del(socketId + redisNsp.offline);
    }
  });



  //check for multi messages
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
  })




  //check if use have s2a message
  redisClient.get(socketId + redisNsp.sent, (err, sended) => {
    if (sended != "true") {
      redisClient.get("s2a", (err, message) => {
        if (message) {
          io.to(socket.id).emit("message", message);
          //save the user for prevent duplication in sending
          redisClient.set(socketId + redisNsp.sent, true,);
        }
      })
    }
  });

});


adminIo.use(auth.auth);

adminIo.on("connection", (socket) => {
  // cache the socket
  redisClient.set(socketId + redisNsp.admin, socket.id);
  socket.on("disconnect", () => {
    console.log('admin left the socket: ');
    //remove user from room
    redisClient.del(socketId + redisNsp.admin);
  });

  //check if admin has message
  redisClient.get(socketId + redisNsp.adminOffline, (err, result) => {
    if (err) return console.log(err);
    if (result) {
      console.log('found offline message: for admin');
      //send the message to the user
      socket.emit("message", result);
      //delete cached message
      redisClient.del(socketId + redisNsp.adminOffline);
    }
  });
});


server.listen(process.env.SERVER_PORT, () => {
  console.log(`server is listening in ${process.env.SERVER_PORT}`);
})
module.exports = { io, adminIo };
