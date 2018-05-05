module.exports = {
  // generate a message object
  generateMessage: (username, text, timestamp) => {
    return {
      from: username,
      text,
      timestamp
    };
  }
};
