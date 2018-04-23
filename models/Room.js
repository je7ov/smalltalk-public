const mongoose = require('mongoose');
const { Schema } = mongoose;
const { ObjectId } = Schema;

const roomSchema = new Schema({
  name: {
    type: String,
    trim: true,
    minlength: 1,
    maxlength: 24,
    unique: true
  },
  nameLower: String,
  userList: [
    {
      userId: ObjectId,
      admin: Boolean
    }
  ],
  messages: [
    {
      text: String,
      fromId: ObjectId,
      from: String,
      timestamp: Date
    }
  ],
  invite: {
    type: String,
    unique: true
  }
});

mongoose.model('rooms', roomSchema);
