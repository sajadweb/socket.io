const NTypes = require('../model/notifications_type');
const subscribe = require('redis').createClient();
const oneToOne = require('./one_to_one');
const oneToMulti = require('./one_to_multi');
const oneToAll = require('./one_to_all');

subscribe.subscribe(NTypes.one);
subscribe.subscribe(NTypes.multi);
subscribe.subscribe(NTypes.all);
subscribe.subscribe(NTypes.ns);

exports.subscriber = (io) => {

  subscribe.on("message", async (channel, message) => {
    console.log(message);
    //convert string to json
    const jsonMessage = JSON.parse(message);
    switch (channel) {
      case NTypes.one:
        oneToOne(jsonMessage.to, message, io);
        break;
      case NTypes.multi:
        oneToMulti(jsonMessage, message, io);
        break;
      case NTypes.all:
        oneToAll(jsonMessage, message, null, io);
        break;
      case NTypes.ns:
        oneToAll(jsonMessage, message, jsonMessage.ns, io);
        break;
    }
  });
}



