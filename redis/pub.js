const redis = require("redis");
const NTypes = require('../model/notifications_type');
const publisher = redis.createClient();


publisher.publish(NTypes.one,
  JSON.stringify({
    "to": "id1",
    "data": {
      "title": "MTitle",
      "image": "http://blablabla.com/bla.png",
      "Time": Date.now(),
    },
    "EX": 600
  }), () => {
    process.exit(0)
  });

publisher.publish(NTypes.multi,
  JSON.stringify({
    "to": ["id1", "id2"],
    "data": {
      "title": "MTitle"
    },
    "EX": 12
  }), () => {
    process.exit(0);
  });


publisher.publish(NTypes.all,
  JSON.stringify({
    "data": {
      "title": "MTitle",
      "image": "http://blablabla.com/bla.png",
      "Time": Date.now(),
    },
    "EX": 12
  }), () => {
    process.exit(0)
  });

// publisher.publish(NTypes.admin,
//   JSON.stringify({
//     "to": ["admin1", "admin2"],
//     "data": {
//       "title": "MTitle",
//       "image": "http://blablabla.com/bla.png"
//     }
//   }), () => {
//     process.exit(0)
//   });
