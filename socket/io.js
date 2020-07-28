const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const adminIo = require('socket.io')(server, { path: '/admin' });
const redisClient = require('redis').createClient();
const auth = require('../controller/auth');

//validate jwt
io.use(auth.auth);

io.on('connection', (socket) => {
  console.log('a user connected to socket: ' + socket.decodedToken.id);

  // cache the socket
  redisClient.set(socket.decodedToken.id + "/ID", socket.id);
  socket.on("disconnect", () => {
    console.log('user left the socket: ');
    //remove user from room
    redisClient.del(socket.decodedToken.id + "/ID");
  });

  //check if user have message ?
  redisClient.get(socket.decodedToken.id + "/OFFLINE", (err, result) => {
    if (err) return console.log(err);
    if (result) {
      console.log('found offline message');
      //send the message to the user
      socket.emit("message", result);
      //delete cached message
      redisClient.del(socket.decodedToken.id + "/OFFLINE");
    }
  });

  //check for multi messages
  redisClient.get("MULTI" + "/OFFLINE", (err, message) => {
    const parsedMessage = JSON.parse(message);
    if (parsedMessage.to.includes(socket.decodedToken.id)) {
      socket.emit("message", message);
      //delete user from array
      const index = parsedMessage.to.indexOf(socket.decodedToken.id);
      parsedMessage.to.splice(index, 1);
      redisClient.set("MULTI" + "/OFFLINE", JSON.stringify(parsedMessage));
    }

    //delete message if no receiver left
    if (parsedMessage.to.length == 0) {
      console.log('deleting offline message');
      redisClient.del("MULTI" + "/OFFLINE");
    }
  });


  //check if use have s2a message
  redisClient.get(socket.decodedToken.id + "/SENT", (err, sended) => {
    if (sended != "true") {
      redisClient.get("s2a", (err, message) => {
        if (message) {
          io.to(socket.id).emit("message", message);
          //save the user for prevent duplication in sending
          redisClient.set(socket.decodedToken.id + "/SENT", true,);
        }
      })
    }
  });

});


adminIo.use(auth.auth);

adminIo.on("connection", (socket) => {
  // cache the socket
  redisClient.set(socket.decodedToken.id + "/ADMIN", socket.id);
  socket.on("disconnect", () => {
    console.log('admin left the socket: ');
    //remove user from room
    redisClient.del(socket.decodedToken.id + "/ADMIN");
  });

  //check if admin has message
  redisClient.get(socket.decodedToken.id + "/ADMIN/OFFLINE", (err, result) => {
    if (err) return console.log(err);
    if (result) {
      console.log('found offline message: for admin');
      //send the message to the user
      socket.emit("message", result);
      //delete cached message
      redisClient.del(socket.decodedToken.id + "/ADMIN/OFFLINE");
    }
  });
});


server.listen(process.env.SERVER_PORT, () => {
  console.log(`server is listening in ${process.env.SERVER_PORT}`);
})
module.exports = { io, adminIo };
