const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const adminIo = require('socket.io')(server, { path: '/admin' });
const redisClient = require('redis').createClient();
const auth = require('../controller/auth');
const redisNsp = require('../redis/namespace');
const async = require('async');
const lodash = require('lodash');

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
  async.forever((next) => {
    redisClient.lpop(socketId + redisNsp.offline, (err, messageKey) => {
      if (err) return console.log(err);
      if (messageKey) {
        redisClient.get(messageKey, (err, message) => {
          if (message) {
            console.log('found offline message');
            socket.emit("message", message);
          }
        });
        next();
      } else {
        next('finish')
      }
    });
  }, (err) => {
    console.log(err);
  })




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

  redisClient.get(redisNsp.s2a, (err, allS2a) => {

    if (allS2a) {
      const allS2aArray = allS2a.split(",");

      async.concat(allS2aArray, (s2aUUID, cb) => {
        redisClient.ttl(s2aUUID, (err, ttl) => {
          if (ttl) {
            redisClient.get(s2aUUID, (err, messageStr) => {
              if (messageStr) {
                redisClient.get(s2aUUID + redisNsp.sent + "/" + socketId, (err, sent) => {
                  if (!sent) {

                    socket.emit("message", messageStr);
                    redisClient.set(s2aUUID + redisNsp.sent + "/" + socketId, true, "EX", ttl);
                  }
                  cb(null, socketId);
                });
              } else {
                //message is expired
                const newS2aArray = lodash.pull(allS2aArray, s2aUUID);
                redisClient.set(redisNsp.s2a, lodash.toString(newS2aArray));
                cb('expired');
              }
            })
          }
        });
      }, (err, result) => {
        // if (err) console.log(err);
        // if (result) console.log(result);
      });
    }
  });


});


adminIo.use(auth.auth);

adminIo.on("connection", (socket) => {
  const socketId = socket.decodedToken.id;
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
