
const redisClient = require('../util/redis').createClient();
const redisNsp = require('../constants/caching_names.enum');
const async = require('async');


exports.onlineUsers = async () => {

  let cursor = 0;
  let onlineUsers = [];

  await async.doWhilst((cb) => {
    redisClient.scan(cursor, redisNsp.MATCH, redisNsp.ID.toOnlineId(), (err, onlineSockets) => {
      if (onlineSockets) {
        for (onlineSocket of onlineSockets[1]) {
          onlineUsers.push(onlineSocket.replace(redisNsp.ID, '').split(redisNsp.namespace)[0]);
        }
        cb(null, onlineSockets);
      } else {
        cb('error in scan');
      }
    });
  },
    (onlineSockets, cb) => {
      if (onlineSockets[0] == "0") {
        return cb('scan online users finished', false);
      } else {
        cursor = onlineSockets[0];
        cb(null, true);
      }
    }).then((v) => {
      console.log(v);
    }).catch((e) => {
      console.log(e);
    });

  return onlineUsers;
}
