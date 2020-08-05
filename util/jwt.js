const jwt = require('jsonwebtoken');

const signToken = (id) => jwt.sign({
  id,
},
  process.env.TOKEN_SECRET_KEY
);


module.exports = signToken;
