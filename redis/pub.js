const redis = require("redis");

const publisher = redis.createClient();

publisher.publish("test", "Hello World", () => {
  process.exit(0)
})
