const express = require('express');
const passport = require('passport');
const mongoose = require('mongoose');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const http = require('http');
const socketIO = require('socket.io');

const keys = require('./config/keys');
require('./models/User');
require('./models/Room');
// require('./services/passport');

mongoose.connect(keys.mongoURI);
mongoose.Promise = global.Promise;

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(
  cookieSession({
    maxAge: 30 * 24 * 60 * 60 * 1000,
    keys: [keys.cookieKey]
  })
);
app.use(passport.initialize());
// app.use(passport.session());

const localLoginStrategy = require('./services/passport/local-login');
const localSignupStrategy = require('./services/passport/local-signup');
passport.use('local-login', localLoginStrategy);
passport.use('local-signup', localSignupStrategy);

const authCheckMiddleware = require('./middlewares/authCheck');
app.use('/api', authCheckMiddleware);

require('./routes/authRoutes')(app);
require('./routes/roomRoutes')(app);
require('./routes/userRoutes')(app);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));

  const path = require('path');
  app.get('*', (req, res) => {
    console.log('fallback');
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const server = http.Server(app);
const io = socketIO(server);

server.listen(PORT, () => {
  console.log(`listening to port ${PORT}`);
  console.log('ENV:', process.env.NODE_ENV);
});

/////////////////////
// SOCKET.IO SETUP //
/////////////////////
const moment = require('moment');
const Rooms = require('./services/socketIO/room');
const { generateMessage } = require('./services/socketIO/message');
const rooms = new Rooms();
const Room = mongoose.model('rooms');

io.on('connection', socket => {
  socket.on('join', (name, room, callback) => {
    const userCheck = rooms.getUserByName(name);

    if (userCheck && userCheck.room.toLowerCase() === room) {
      return callback('Username is already in use');
    }

    socket.join(room);

    rooms.removeUser(socket.id);
    rooms.addUser(socket.id, name, room);
  });

  socket.on('disconnect', () => {
    rooms.removeUser(socket.id);
  });

  socket.on('createMessage', async (message, roomId, callback) => {
    const user = rooms.getUser(socket.id);
    const roomData = await Room.findById(roomId);

    if (roomData) {
      const timestamp = moment().valueOf();

      roomData.messages.push({
        from: user.name,
        text: message,
        timestamp
      });

      roomData.save();

      if (user) {
        io
          .to(user.room)
          .emit('newMessage', generateMessage(user.name, message, timestamp));
      }

      callback();
    }
  });
});
