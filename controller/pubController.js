const NTypes = require('../constants/notification_types.enum');
const redisClient = require('../util/redis').createClient();

exports.sendOneToOne = (data) => {

  redisClient.publish(
    NTypes.one,
    JSON.stringify(data),
    () => {
      console.log("one to one",);
    });
}


exports.sendOneToMulti = (data) => {
  redisClient.publish(
    NTypes.multi,
    JSON.stringify(data),
    () => {
      console.log("one to multi");
    });
}

exports.oneToAll = (data) => {
  redisClient.publish(
    NTypes.all,
    JSON.stringify(data),
    () => {
      console.log("one to multi");
    }
  );
}

exports.oneToNamespace = (data) => {
  redisClient.publish(
    NTypes.ns,
    JSON.stringify(data),
    () => {
      console.log("one to namespace");
    }
  );
}
