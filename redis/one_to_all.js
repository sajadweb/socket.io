const lodash = require("lodash");
const redisClient = require('redis').createClient();
const async = require('async');
const redisNsp = require('./namespace');
const { v4: uuidv4 } = require('uuid');


// 1- save the message
// 2- scan the all online users
// note: scan return an array that
// first index: stands for next scan calling cursor
// second index: stands for list of keys
// 3- for all online sockets send the s2a
// note: check for prevent duplicate sending
// for this purpose after s2a for a user
// a set with key: messageKey + redisNsp.sent + "/" + socketId.replace(redisNsp.id, '')
// will occurs
// 4- save the s2a message to global s2a list
// note that expiration added to first stage not the list



const oneToAll = (messageJson, message, ns, io) => {
  let namespace = redisNsp.id;
  if (ns) {
    namespace = redisNsp.namespace + ns + namespace;
  }
  const messageKey = uuidv4();

  let EX;
  if (messageJson.EX) {
    EX = messageJson.EX;
  } else {
    EX = process.env.MESSAGE_EXPIRES;
  }
  redisClient.set(messageKey, message, 'EX', EX);

  let scanCursor = 0;
  async.doWhilst((cb) => {

    redisClient.scan(scanCursor, "match", "*" + namespace, (err, onlineSockets) => {
      if (onlineSockets) {
        async.concat(onlineSockets[1], (socketId, callback) => {
          redisClient.get(socketId, (err, sId) => {
            if (sId) {
              //check if this message sended before
              let checkKey = messageKey + redisNsp.sent + "/" + socketId.replace(namespace, '');
              redisClient.get(checkKey, (err, sended) => {
                if (!sended) {
                  if (io.sockets.connected[sId]) {
                    io.to(sId).emit("message", message);
                    //save the user for prevent duplication in sending
                    redisClient.set(checkKey, true, "EX", EX);
                    callback(null, 'ok');
                  } else {
                    callback('user is offline');
                  }
                } else {
                  callback('sended before');
                }
              });
            } else {
              callback('user is offline');
            }
          });
        }, (err, result) => {
          // if (result) console.log(result);
          // if (err) console.log(err);
        });

        cb(null, onlineSockets);
      } else {
        cb('error in scan!!');
      }
    });

  }, (onlineSockets, cb) => {
    if (onlineSockets[0] == "0") {
      return cb("finish searching", false);
    }
    scanCursor = onlineSockets[0];
    cb(null, true)
  }, (err) => {
    // console.log(err);
  })


  //save in s2a
  //check for another s2a
  redisClient.get(redisNsp.s2a, (err, allKeys) => {
    if (allKeys) {
      redisClient.set(redisNsp.s2a, lodash.toString((lodash.concat(allKeys, messageKey))));
    } else {
      redisClient.set(redisNsp.s2a, messageKey);
    }
  });

}

module.exports = oneToAll;
