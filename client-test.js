const dotenv = require('dotenv');
dotenv.config();
const signToken = require('./util/jwt');

// // register for message
const socket = require('socket.io-client')(`http://localhost:${process.env.SERVER_PORT}`, {
  query: {
    token: signToken('myWiredId')
  }
});

socket.on("connect", function () {
  console.log('connected');
});

socket.on('message', (data) => {
  console.log('client1 incoming message')
  console.log(data);
});



const socket1 = require('socket.io-client')(`http://localhost:${process.env.SERVER_PORT}`, {
  query: {
    token: signToken('id2')
  }
});

socket1.on("connect", function () {
  console.log('connected');
});

socket1.on('message', (data) => {
  console.log('client2 incoming message')
  console.log(data);
});


// const socket2 = require('socket.io-client')(`http://localhost:${process.env.SERVER_PORT}`, {
//   query: {
//     token: signToken('admin1')
//   },
//   path: '/admin'
// });

// socket2.on("connect", function () {
//   console.log('connected');
// });

// socket2.on("message", function (message) {
//   console.log(message);
// });
