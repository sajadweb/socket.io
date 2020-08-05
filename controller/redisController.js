
const redisClient = require('redis').createClient();
const redisNsp = require('../redis/namespace');
const async = require('async');
const util = require('util');

exports.onlineUsers = async () => {

  let cursor = 0;
  let onlineUsers = [];

  await async.doWhilst((cb) => {
    redisClient.scan(cursor, "match", "*" + redisNsp.id, (err, onlineSockets) => {
      if (onlineSockets) {
        for (onlineSocket of onlineSockets[1]) {
          onlineUsers.push(onlineSocket.replace(redisNsp.id, '').split(redisNsp.namespace)[0]);
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
