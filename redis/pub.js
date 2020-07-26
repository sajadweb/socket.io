const redis = require("redis");

const publisher = redis.createClient();

publisher.publish("oneNotification",
  JSON.stringify({
    "to": "myWiredId", "data": {
      "title": "MTitle",
      "image": "http://blablabla.com/bla.png"
    }
  }), () => {
    process.exit(0)
  })
