const NTypes = require('../model/notifications_type');
const subscribe = require('redis').createClient();
const oneToOne = require('./one_to_one');
const oneToMulti = require('./one_to_multi');
const oneToAll = require('./one_to_all');


subscribe.on("message", async (channel, message) => {

  //convert string to json
  const jsonMessage = JSON.parse(message);

  switch (channel) {
    case NTypes.one:
      oneToOne(jsonMessage.to, message);
      break;
    case NTypes.multi:
      oneToMulti(jsonMessage, message);
      break;
    case NTypes.all:
      oneToAll(jsonMessage, message);
      break;

  }

  // if (channel == NTypes.admin) {
  //   for (let to of jsonMessage.to) {
  //     adminSubs(to, message);
  //   }

  //   return;
  // }
});


// const adminSubs = (to, message) => {
//   redisClient.get(to + redisNsp.admin, (err, sId) => {
//     if (sId) {
//       adminIo.to(sId).emit("message", message);
//     } else {
//       //admin is offline
//       redisClient.set(to + redisNsp.adminOffline, message, 'EX', process.env.MESSAGE_EXPIRES);
//     }

//   })
// }

module.exports = subscribe;


