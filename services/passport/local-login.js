const jwt = require('jsonwebtoken');
const User = require('mongoose').model('users');
const PassportLocalStrategy = require('passport-local');
const keys = require('../../config/keys');

module.exports = new PassportLocalStrategy(async (username, password, done) => {
  const userData = {
    username: username.trim(),
    password: password.trim()
  };

  const user = await User.findOne({ username: username.trim() });

  if (!user) {
    const error = new Error('Incorrect username');
    error.name = 'IncorrectUsernameError';

    return done(error);
  }

  const valid = await user.checkPassword(password.trim());
  if (!valid) {
    const error = new Error('Incorrect password');
    error.name = 'IncorrectPasswordError';

    return done(error);
  }

  const payload = {
    sub: user._id
  };

  const token = jwt.sign(payload, keys.jwtSecret);
  const data = {
    name: user.username
  };

  return done(null, token, data);
});
