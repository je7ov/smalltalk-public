const jwt = require('jsonwebtoken');
const User = require('mongoose').model('users');
const keys = require('../config/keys');

module.exports = (req, res, next) => {
  // if no token, send 401
  if (!req.headers.authorization) {
    return res.status(401).end();
  }

  const token = req.headers.authorization.split(' ')[1];

  // decode jwt and get userId from it
  const decoded = jwt.verify(token, keys.jwtSecret);
  const userId = decoded.sub;

  // look for user by id, return 401 if none found
  const user = User.findById(userId);
  if (!user) {
    return res.status(401).end();
  }

  // user found, continue to next
  return next();
};
