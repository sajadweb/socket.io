const redis = require("redis");

const subscriber = redis.createClient();

subscriber.on("message", (channel, message) => {
  console.log("message: " + message + " on channel:" + channel + " just arrives!")
})

subscriber.subscribe("test");
