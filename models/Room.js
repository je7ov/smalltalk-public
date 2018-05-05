const mongoose = require('mongoose');
const { Schema } = mongoose;
const { ObjectId } = Schema;

// TODO: better way to store messages?
const roomSchema = new Schema({
  // name of room
  name: {
    type: String,
    trim: true,
    minlength: 1,
    maxlength: 24,
    unique: true
  },
  // name in lowercase for searching
  nameLower: String,
  // users with access to room
  userList: [
    {
      userId: ObjectId,
      admin: Boolean
    }
  ],
  // array of all messages in room
  messages: [
    {
      text: String,
      fromId: ObjectId,
      from: String,
      timestamp: Date
    }
  ],
  // random string for invite link
  invite: {
    type: String,
    unique: true
  }
});

mongoose.model('rooms', roomSchema);
