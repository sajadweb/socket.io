const redisClient = require('redis').createClient();
const redisNsp = require('../../constants/caching_names.enum');
const async = require('async');

const onlineUsers = (socket) => {

  let cursor = 0;
  let onlineUsers = [];
  async.doWhilst((cb) => {
    redisClient.scan(cursor, "match", redisNsp.ID.toOnlineId(), (err, onlineSockets) => {
      if (onlineSockets) {
        for (onlineSocket of onlineSockets[1]) {

          onlineUsers.push(onlineSocket.split("/")[0]);
        }
        cb(null, onlineSockets);
      } else {
        cb('error in scan');
      }
    });
  },
    (onlineSockets, cb) => {
      if (onlineSockets[0] == "0") {
        socket.emit("message", onlineUsers.toString());
        return cb('scan online users finished', false);
      } else {
        cursor = onlineSockets[0];
        cb(null, true);
      }
    },
    (err) => {
      console.log(err);
    });


}

module.exports = onlineUsers;
