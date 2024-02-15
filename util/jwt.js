const jwt = require('jsonwebtoken');

const secretKey = 'your-secret-key';

function createJwtToken(payload) {
  return jwt.sign(payload, secretKey); 
}

module.exports = {createJwtToken};