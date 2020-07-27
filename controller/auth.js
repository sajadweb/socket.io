const jwt = require('jsonwebtoken');
const util = require('util');


exports.auth = async (socket, next) => {
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
