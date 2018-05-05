const mongoose = require('mongoose');
const { Schema } = mongoose;
const { ObjectId } = Schema;
const bcrypt = require('bcryptjs');

const userSchema = new Schema({
  // user google id for future use, if user wants to login with google
  googleId: String,
  // user's username
  username: {
    type: String,
    trim: true,
    minlength: 4,
    maxlength: 16,
    unique: true
  },
  // username in lowercase for lookups
  usernameLower: {
    type: String,
    unique: true
  },
  // users hashed password
  password: {
    type: String,
    minlength: 6
  },
  // arary of room ids that user has access to
  roomsOwned: [ObjectId],
  //array of user ids of users friends
  friends: [ObjectId]
});

// Check incoming password to saved hashed password
userSchema.methods.checkPassword = async function (password) {
  const res = await bcrypt.compare(password, this.password).catch(err => {
    console.log(err.stack);
    return false;
  });

  return res;
};

// If password is ever set to a new password, rehash before saving it
userSchema.pre('save', function (next) {
  const user = this;

  if (!user.isModified('password')) return next();

  return bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(user.password, salt, (err, hash) => {
      user.password = hash;

      return next();
    });
  });
});

mongoose.model('users', userSchema);
