const dotenv = require('dotenv');
const sub = require('./redis/sub');
const socketio = require('socket.io');
const { auth } = require('./controller/auth');
const { onConnection } = require('./socket/io');



exports.init = (server) => {
  dotenv.config();
  const io = socketio(server);
  io.use(auth);
  io.on('connection', onConnection);
  sub.subscriber(io);
}






