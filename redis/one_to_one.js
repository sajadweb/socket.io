const redisClient = require('redis').createClient();
const io = require('../socket/io').io;
const redisNsp = require('./namespace');
const { v4: uuidv4 } = require('uuid');


const oneToOne = (socketId, message) => {

  // 1- user is online send message
  // 2- if user is offline :
  // first: save the message
  // second: create a list of messages Key for
  // that pop when user onlines and i the last
  // the list will removed.
  redisClient.get(socketId + redisNsp.id, (err, sId) => {
    if (err) {
      //TODO Error handling
      console.log(err);
    }

    if (sId) {
      io.to(sId).emit("message", message);
    } else {
      // console.log('user is offline(lets save the message!): '
      //   + to + redisNsp.offline);
      const messageKey = uuidv4();
      const messageJson = JSON.parse(message);
      let EX;
      if (messageJson.EX) {
        EX = messageJson.EX;
      } else {
        EX = process.env.MESSAGE_EXPIRES;
      }
      redisClient.set(messageKey, message, 'EX', EX);
      redisClient.rpush(socketId + redisNsp.offline, messageKey);
    }
  });
}

module.exports = oneToOne;
