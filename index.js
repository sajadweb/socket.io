require('./config/extensions');
const sub = require('./services/pubsub/sub');
const socketio = require('socket.io');
const { auth } = require('./controller/auth');
const { onConnection } = require('./services/socket/io');
const http = require('http');
const pub = require('./controller/pubController');
const redisController = require('./controller/redisController');
const socketEnum = require('./constants/socket.enum');

const init = (app) => {
  const server = http.createServer(app);
  const io = socketio(server);
  io.use(auth);
  io.on(socketEnum.CONNECTION, onConnection);
  sub.subscriber(io);
  return server;
}

module.exports = {
  init,
  sendOneToOne: pub.sendOneToOne,
  sendOneToMulti: pub.sendOneToMulti,
  sendOneToAll: pub.oneToAll,
  getOnlineUsers: redisController.onlineUsers,
};

