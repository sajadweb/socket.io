const redisClient = require('redis').createClient();
const io = require('../socket/io').io;
const async = require('async');
const loadash = require('lodash');
const redisNsp = require('./namespace');
const { v4: uuidv4 } = require('uuid');


const oneToMulti = (messageJson, message) => {


  // 1- send message to all online users
  // 2- save the message
  // 3- find offline receivers ( message to list subtract online sended )
  // 4- push messageKey in offline box of user
  // note : the saved message persist in redis until in some
  // cronjobs call the scan on redisClient to remove expired keys.
  async.concat(messageJson.to, (socketId, callback) => {

    redisClient.get(socketId + redisNsp.id, (err, sId) => {
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
        if (io.sockets.connected[sId]) {
          io.to(sId).emit("message", message);
          callback(null, socketId);
        } else {
          callback("offline");
        }
      } else {
        console.log('user is offline: ' + "message saved for offline users!");
        callback("offline")
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
      redisClient.set(messageKey, message, 'EX', EX);


      const offlineReceivers = loadash.difference(messageJson.to, ids);
      async.concat(offlineReceivers, (offline) => {
        redisClient.rpush(offline + redisNsp.multiOffline, messageKey);
      });

    }
  })
}
module.exports = oneToMulti;
