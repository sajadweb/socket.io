const _ = require('lodash');
const redisClient = require('../../util/redis').createClient();
const async = require('async');
const redisNsp = require('../../constants/caching_names.enum');
const { v4: uuidv4 } = require('uuid');
const socketEnum = require('../../constants/socket.enum');
const statusEnum = require('../../constants/status.enum');



const sendToNamespace = (messageJson, message, ns, io) => {

  const namespace = redisNsp.NAMESPACE + ns;

  console.log(namespace);
  const messageKey = uuidv4();

  let EX;
  if (messageJson.EX) {
    EX = messageJson.EX;
  } else {
    EX = process.env.MESSAGE_EXPIRES;
  }
  redisClient.set(messageKey, message, redisNsp.EX, EX);



  let scanCursor = 0;
  async.doWhilst((cb) => {


    redisClient.scan(scanCursor, redisNsp.MATCH, namespace.toOnlineNs(), (err, onlineSockets) => {
      if (onlineSockets) {
        async.concat(onlineSockets[1], (socketId, callback) => {
          redisClient.get(socketId, (err, sId) => {
            if (sId) {
              //check if this message sended before
              let checkKey = messageKey + redisNsp.SENT + "/" + socketId.replace(redisNsp.ID, '');
              redisClient.get(checkKey, (err, sended) => {
                if (!sended) {
                  if (_.get(io.sockets, sId.toConnected(), null)) {
                    io.to(sId).emit(socketEnum.MESSAGE, message);
                    //save the user for prevent duplication in sending
                    redisClient.set(checkKey, true, redisNsp.EX, EX);
                    callback(null, 'ok');
                  } else {
                    callback(statusEnum.OFFLINE);
                  }
                } else {
                  callback('sended before');
                }
              });
            } else {
              callback(statusEnum.OFFLINE);
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

  //save in namespace offline
  //check for another namespace offline
  redisClient.get(redisNsp.NAMESPACE_OFFLINE, (err, allKeys) => {
    if (allKeys) {
      redisClient.set(redisNsp.NAMESPACE_OFFLINE, _.toString((_.concat(allKeys, messageKey))));
    } else {
      redisClient.set(redisNsp.NAMESPACE_OFFLINE, messageKey);
    }
  });

}
module.exports = sendToNamespace;
