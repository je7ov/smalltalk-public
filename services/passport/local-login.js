const jwt = require('jsonwebtoken');
const User = require('mongoose').model('users');
const PassportLocalStrategy = require('passport-local');
const keys = require('../../config/keys');

module.exports = new PassportLocalStrategy(async (username, password, done) => {
  username = username.trim();
  password = password.trim();

  // look for user in database with username
  const user = await User.findOne({ username });

  // it user doesn't exist, return error
  if (!user) {
    const error = new Error('Incorrect username');
    error.name = 'IncorrectUsernameError';

    return done(error);
  }

  // confirm password is correct
  const valid = await user.checkPassword(password);
  // if password not valid, return error
  if (!valid) {
    const error = new Error('Incorrect password');
    error.name = 'IncorrectPasswordError';

    return done(error);
  }

  // create jwt payload
  const payload = {
    sub: user._id
  };

  // create jwt
  const token = jwt.sign(payload, keys.jwtSecret);
  const data = {
    name: user.username
  };

  // return jwt and user data
  return done(null, token, data);
});
