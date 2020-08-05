const sub = require('./redis/sub');
const socketio = require('socket.io');
const { auth } = require('./controller/auth');
const { onConnection } = require('./socket/io');
const http = require('http');
const pub = require('./controller/pubController');
const redisController = require('./controller/redisController');


const init = (app) => {
  const server = http.createServer(app);
  const io = socketio(server);
  io.use(auth);
  io.on('connection', onConnection);
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

