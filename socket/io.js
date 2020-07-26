const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const jwt = require('jsonwebtoken');
const util = require('util');
const redisClient = require('redis').createClient();

//validate jwt
io.use(
  async function (socket, next) {
    if (socket.handshake.query && socket.handshake.query.token) {
      const token = socket.handshake.query.token;
      let decodedToken;
      try {
        decodedToken = await util.promisify(jwt.verify)(token, process.env.TOKEN_SECRET_KEY);
        socket.decodedToken = decodedToken;
        next();
      } catch (e) {
        console.log('Token not valid!');
      }
    } else {
      console.log('Token is Missing!');
    }
  }
)
io.on('connection', (socket) => {
  console.log('hi: ' + socket.decodedToken.id);

  //check if user have message ?
  redisClient.get(socket.decodedToken.id, (err, result) => {
    if (err) return console.log(err);
    if (result) {
      console.log('found message: ' + result);
      //send the message to the user
      socket.emit("message", JSON.parse(result));

      //delete cached message
      redisClient.del(socket.decodedToken.id);
    }



  });


});



server.listen(process.env.SERVER_PORT, () => {
  console.log(`server is listening in ${process.env.SERVER_PORT}`);
})
module.exports = io;
