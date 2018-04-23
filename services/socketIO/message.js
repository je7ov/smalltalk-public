module.exports = {
  generateMessage: (username, text, timestamp) => {
    return {
      from: username,
      text,
      timestamp
    };
  }
};
