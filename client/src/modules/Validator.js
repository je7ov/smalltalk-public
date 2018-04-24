const usernameConfig = {
  min: 4,
  max: 16
};
const passwordConfig = {
  min: 6,
  max: 24
};

class Validator {
  static validateLogin(username, password) {
    let valid = true,
      error = null;

    username = username.trim();
    password = password.trim();
    if (username === '' || password === '') {
      valid = false;
      error = 'All fields must be filled out.';
    }

    return { valid, error };
  }

  static validateUsername(username) {
    let valid = true,
      error = null;

    username = username.trim();
    if (username === '') {
      valid = false;
      error = 'All fields must be filled out.';
    } else if (!username.match(/^[0-9a-zA-Z. ]+$/)) {
      valid = false;
      error = 'Username must be alphanumeric with periods.';
    } else if (
      username.length < usernameConfig.min ||
      username.length > usernameConfig.max
    ) {
      valid = false;
      error = `Username must be ${usernameConfig.min}-
      ${usernameConfig.max} characters long`;
    }

    return { valid, error };
  }

  static validatePassword(password) {
    let valid = true,
      error = null;

    password = password.trim();
    if (password === '') {
      valid = false;
      error = 'All fields must be filled out.';
    } else if (!password.match(/^[0-9a-zA-Z]+$/)) {
      valid = false;
      error = 'Password must be alphanumeric.';
    } else if (
      password.length < passwordConfig.min ||
      password.length > passwordConfig.max
    ) {
      valid = false;
      error = `Password must be ${passwordConfig.min}-
      ${passwordConfig.max} characters long`;
    }

    return { valid, error };
  }
}

export default Validator;
