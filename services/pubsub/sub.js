const NTypes = require('../../constants/notification_types.enum');
const subscribe = require('../../util/redis').createClient();
const sendToOne = require('./send_to_one');
const sendToMulti = require('./send_to_multi');
const sendToAll = require('./send_to_all');
const sendToNamespace = require('./send_to_namespace');
const socketEnum = require('..//../constants/socket.enum');

subscribe.subscribe(NTypes.one);
subscribe.subscribe(NTypes.multi);
subscribe.subscribe(NTypes.all);
subscribe.subscribe(NTypes.ns);

exports.subscriber = (io) => {

  subscribe.on(socketEnum.MESSAGE, async (channel, message) => {
    console.log(message);
    //convert string to json
    const jsonMessage = JSON.parse(message);
    switch (channel) {
      case NTypes.one:
        sendToOne(jsonMessage.to, message, io);
        break;
      case NTypes.multi:
        sendToMulti(jsonMessage, message, io);
        break;
      case NTypes.all:
        sendToAll(jsonMessage, message, io);
        break;
      case NTypes.ns:
        sendToNamespace(jsonMessage, message, jsonMessage.ns, io);
        break;
    }
  });
}



