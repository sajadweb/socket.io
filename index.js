const sub = require('./redis/sub');
const socketio = require('socket.io');
const { auth } = require('./controller/auth');
const { onConnection } = require('./socket/io');
const http = require('http');
const pub = require('./controller/pubController');
const redisController = require('./controller/redisController');


exports.init = (app) => {
  const server = http.createServer(app);
  const io = socketio(server);
  io.use(auth);
  io.on('connection', onConnection);
  sub.subscriber(io);
  return server;
}

exports.pub = pub;
exports.redis = redisController;
