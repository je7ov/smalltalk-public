const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const randomstring = require('randomstring');
const keys = require('../config/keys');

const User = mongoose.model('users');
const Room = mongoose.model('rooms');

module.exports = app => {
  /////////////////////
  // CREATE NEW ROOM //
  /////////////////////
  app.post('/api/new_room', async (req, res) => {
    const userId = decodeJWT(req.headers);

    let { name } = req.body;
    name = name.trim();

    const nameError = await validRoomName(name);
    if (nameError) {
      console.log(nameError);
      return res
        .status(400)
        .json(nameError)
        .send();
    }

    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found');
      return res
        .status(400)
        .json({
          success: false,
          message: 'User not found'
        })
        .send();
    }

    try {
      const inviteLink = randomstring.generate(12);
      const room = await new Room({
        name,
        nameLower: name.toLowerCase(),
        userList: {
          userId,
          admin: true
        },
        invite: inviteLink
      }).save();

      user.roomsOwned.push(room.id);
      user.save();

      return res
        .json({
          success: true,
          message: 'The room was successfully created!'
        })
        .send();
    } catch (error) {
      console.log('Database error:', error);
      return res
        .status(400)
        .json({
          success: false,
          message: 'Database error'
        })
        .send();
    }
  });

  ///////////////////
  // DELETE A ROOM //
  ///////////////////
  app.post('/api/delete_room', async (req, res) => {
    const userId = decodeJWT(req.headers);

    let { id } = req.body;
    // name = name.trim();

    const room = await Room.findById(id);
    // const room = await Room.findOne({ nameLower: name.toLowerCase() });
    if (!room) {
      return res
        .status(400)
        .json({ success: false, message: 'Room not found' })
        .send();
    }

    const userData = room.userList.find(user => (user.userid = userId));
    if (!userData) {
      return res
        .status(400)
        .json({ success: false, message: 'User not found' })
        .send();
    }

    if (!userData.admin) {
      return res
        .status(401)
        .json({ success: false, message: 'Unauthorized to delete' })
        .send();
    }

    Room.remove({ _id: room.id }, async err => {
      if (err) {
        return res
          .status(400)
          .json({ success: false, message: 'Error removing room' })
          .send();
      }

      const user = await User.findById(userData.userId);
      if (user) {
        updatedRooms = user.roomsOwned.filter(
          roomOwned => !roomOwned.equals(room.id)
        );
        user.roomsOwned = user.roomsOwned.filter(
          roomOwned => !roomOwned.equals(room._id)
        );
        user.save();
      }

      res.json({ success: true, message: 'Room successfully deleted' });
    });
  });

  ////////////////////////////////
  // GET MESSAGES OF ROOM BY ID //
  ////////////////////////////////
  app.get('/api/messages/:id', async (req, res) => {
    const { id } = req.params;

    const room = await Room.findById(id);
    if (!room) {
      return res
        .status(400)
        .json({ success: false, message: 'Room not found' })
        .send();
    }

    // TODO: Limit number of messages sent back for initial load
    res.send(room.messages);
  });

  ///////////////////////////////////
  // GET INVITE LINK OF ROOM BY ID //
  ///////////////////////////////////
  app.get('/api/link/:id', async (req, res) => {
    const userId = decodeJWT(req.headers);
    const { id } = req.params;

    const room = await Room.findById(id);
    if (!room) {
      return res
        .status(400)
        .json({ success: false, message: 'Room not found' })
        .send();
    }

    let hasAccess = false;
    room.userList.some(user => {
      if (user.userId.equals(userId)) {
        if (user.admin) hasAccess = true;
        return true;
      }
    });

    if (hasAccess) {
      res.send(`${req.headers.host}/invite/${room.invite}`);
    } else {
      res
        .status(401)
        .json({ success: false, message: 'Not authorized to get link' })
        .send();
    }
  });

  ///////////////////////////////////////////
  // GET ROOM INFORMATION FROM INVITE LINK //
  ///////////////////////////////////////////
  app.get('/api/invite/:link', async (req, res) => {
    const userId = decodeJWT(req.headers);
    const { link } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      res
        .status(400)
        .json({ success: false, message: 'User not found' })
        .send();
    }

    const room = await Room.findOne({ invite: link });

    if (!room) {
      res
        .status(400)
        .json({ success: false, message: 'Room not found' })
        .send();
    }

    let alreadyIn = false;
    room.userList.some(u => {
      if (u.userId.equals(userId)) {
        alreadyIn = true;
        return true;
      }
    });

    const roomData = {
      id: room.id,
      name: room.name,
      alreadyIn
    };

    res.send(roomData);
  });

  app.post('/api/invite/:link', async (req, res) => {
    const userId = decodeJWT(req.headers);
    const { link } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      res
        .status(400)
        .json({ success: false, message: 'User not found' })
        .send();
    }

    const room = await Room.findOne({ invite: link });

    if (!room) {
      res
        .status(400)
        .json({ success: false, message: 'Room not found' })
        .send();
    }

    user.roomsOwned.push(room.id);
    user.save();

    room.userList.push({
      userId,
      admin: false
    });
    room.save();

    res.send({ accepted: true });
  });
};

//////////////////////
// HELPER FUNCTIONS //
//////////////////////
async function validRoomName(name) {
  const existingRoom = await Room.findOne({
    nameLower: name.trim().toLowerCase()
  });

  if (existingRoom) {
    return {
      success: false,
      message: 'Room already exists'
    };
  } else if (name === '') {
    return {
      success: false,
      message: 'Room name is empty'
    };
  } else if (!name.match(/^[0-9a-zA-Z '.?!-]+$/)) {
    return {
      success: false,
      message: 'Room name must be alphanumeric'
    };
  }

  return null;
}

function decodeJWT(headers) {
  const token = headers.authorization.split(' ')[1];
  const decoded = jwt.verify(token, keys.jwtSecret);
  const userId = decoded.sub;

  return userId;
}
