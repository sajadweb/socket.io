const redis = require("redis");
const NTypes = require('../model/notifications_type');
const publisher = redis.createClient();

publisher.publish(NTypes.one,
  JSON.stringify({
    "to": "myWiredId", "data": {
      "title": "MTitle",
      "image": "http://blablabla.com/bla.png"
    }
  }), () => {
    process.exit(0)
  });

// publisher.publish(NTypes.multi,
//   JSON.stringify({
//     "to": ["myWiredId", "id3"], "data": {
//       "title": "MTitle",
//       "image": "http://blablabla.com/bla.png"
//     }
//   }), () => {
//     process.exit(0)
//   });
// publisher.publish(NTypes.all,
//   JSON.stringify({
//     "data": {
//       "title": "MTitle",
//       "image": "http://blablabla.com/bla.png"
//     }
//   }), () => {
//     process.exit(0)
//   });

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
