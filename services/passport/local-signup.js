const User = require('mongoose').model('users');
const PassportLocalStrategy = require('passport-local').Strategy;

const usernameConfig = {
  min: 4,
  max: 16
};
const passwordConfig = {
  min: 4,
  max: 24
};

module.exports = new PassportLocalStrategy(async (username, password, done) => {
  username = username.trim();

  // check if username is valid
  const validUsernameError = validateUsername(username);
  if (validUsernameError) {
    return done(validUsernameError);
  }

  // check if password is valid
  const validPasswordError = validatePassword(password);
  if (validPasswordError) {
    return done(validPasswordError);
  }

  // create new user in database
  const user = await new User({
    username,
    usernameLower: username.toLowerCase(),
    password
  })
    .save()
    .catch(err => done(err));

  return done(null);
});

// check if username follows our username criteria
function validateUsername(username) {
  const errorName = 'InvalidUsername';
  if (username === '') {
    const error = new Error('Username is empty');
    error.name = errorName;

    return error;
  }
  if (!username.match(/^[0-9a-zA-Z. ]+$/)) {
    const error = new Error('Username is not alphanumeric');
    error.name = errorName;

    return error;
  } else if (
    username.length < usernameConfig.min ||
    username.length > usernameConfig.max
  ) {
    const error = new Error(
      `Username is not ${usernameConfig.min}-${usernameConfig.max} characters`
    );
    error.name = errorName;

    return error;
  }

  return null;
}

// check if password follows our password criteria
function validatePassword(password) {
  const errorName = 'InvalidPassword';
  if (password === '') {
    const error = new Error('Password is empty');
    error.name = errorName;

    return error;
  } else if (!password.match(/^[0-9a-zA-Z]+$/)) {
    const error = new Error('Password is not alphanumeric');
    error.name = errorName;

    return error;
  } else if (
    password.length < passwordConfig.min ||
    password.length > passwordConfig.max
  ) {
    const error = new Error(
      `Password is not ${passwordConfig.min}-${passwordConfig.max} characters`
    );
    error.name = errorName;

    return error;
  }

  return null;
}
