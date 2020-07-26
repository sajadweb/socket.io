const dotenv = require('dotenv');
dotenv.config();
const signToken = require('./util/jwt');

// register for message
const socket = require('socket.io-client')(`http://localhost:${process.env.SERVER_PORT}`, {
  query: {
    token: signToken('myWiredId')
  }
});

socket.on("connect", function () {
  console.log('connected');
});

socket.on('message', (data) => {
  console.log('hoooray! message recived!')
  console.log(data);
});

