const redisClient = require('redis').createClient();
const async = require('async');
const _ = require('lodash');
const redisNsp = require('../../constants/caching_names.enum');
const { v4: uuidv4 } = require('uuid');
const socketEnum = require('../../constants/socket.enum');
const statusEnum = require('../../constants/status.enum');
const sendToMulti = (messageJson, message, io) => {


  // 1- send message to all online users
  // 2- save the message
  // 3- find offline receivers ( message to list subtract online sended )
  // 4- push messageKey in offline box of user
  // note : the saved message persist in redis until expires.
  async.concat(messageJson.to, (socketId, callback) => {

    redisClient.get(socketId + redisNsp.ID, (err, sId) => {
      if (err) {
        console.log(err);
      }
      if (sId) {
        //check if really user in online?
        //usefull when server crushes
        //when server crushes and redis don't
        //the socketId will exsist in db
        //after server runs again the saved
        //socketId will refreshes in db
        if (_.get(io.sockets, sId.toConnected(), null)) {
          io.to(sId).emit(socketEnum.MESSAGE, message);
          callback(null, socketId);
        } else {
          callback(statusEnum.OFFLINE);
        }
      } else {
        callback(statusEnum.OFFLINE)
      }
    })
  }, (err, ids) => {
    if (err) {

      //save the message
      const messageKey = uuidv4();

      let EX;
      if (messageJson.EX) {
        EX = messageJson.EX;
      } else {
        EX = process.env.MESSAGE_EXPIRES;
      }
      redisClient.set(messageKey, message, redisNsp.EX, EX);

      const offlineReceivers = _.difference(messageJson.to, ids);
      async.concat(offlineReceivers, (offline) => {
        redisClient.rpush(offline + redisNsp.MULTI_OFFLINE, messageKey);
      });

    }
  })
}
module.exports = sendToMulti;
