const redisClient = require('redis').createClient();
const redisNsp = require('../../constants/caching_names.enum');
const { v4: uuidv4 } = require('uuid');
const socketEnum = require('../../constants/socket.enum');
const _ = require('lodash');

const sendToOne = (socketId, message, io) => {

  // 1- user is online send message
  // 2- if user is offline :
  // first: save the message
  // second: create a list of messages Key for
  // that pop when user onlines and i the last
  // the list will removed.
  redisClient.get(socketId + redisNsp.ID, (err, sId) => {
    if (err) {
      //TODO Error handling
      console.log(err);
    }

    if (sId && _.get(io.sockets, sId.toConnected(), null)) {

      io.to(sId).emit(socketEnum.MESSAGE, message);

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
      redisClient.set(messageKey, message, redisNsp.EX, EX);
      redisClient.rpush(socketId + redisNsp.OFFLINE, messageKey);
    }
  });
}

module.exports = sendToOne;
