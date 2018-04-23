const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const keys = require('../config/keys');

const User = mongoose.model('users');
const Room = mongoose.model('rooms');

module.exports = app => {
  ///////////////////////////////
  // GET CURRENT USER FROM JWT //
  ///////////////////////////////
  app.get('/api/current_user', async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, keys.jwtSecret);
    const userId = decoded.sub;

    const userData = await User.findById(userId);

    let user = null;
    if (userData) {
      const roomsOwned = [];
      for (const roomId of userData.roomsOwned) {
        const room = await Room.findById(roomId);
        if (room) {
          roomsOwned.push({ name: room.name, id: roomId });
        }
      }
      const friends = [];
      for (const friendId of userData.friends) {
        const friend = await User.findById(friendId);
        if (friend) {
          friends.push({ name: friend.username });
        }
      }

      user = {
        id: userData.id,
        username: userData.username,
        roomsOwned,
        friends
      };
    }

    res.send(user);
  });
};
