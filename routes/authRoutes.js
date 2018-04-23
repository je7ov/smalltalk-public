const passport = require('passport');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const keys = require('../config/keys');

const User = mongoose.model('users');
const Room = mongoose.model('rooms');

module.exports = app => {
  // authenticate with google
  app.get(
    '/auth/google',
    passport.authenticate('google', {
      scope: ['profile', 'email']
    })
  );

  // callback for google auth
  app.get(
    '/auth/google/callback',
    passport.authenticate('google'),
    (req, res) => {
      res.redirect('/');
    }
  );

  ////////////////////////////////////////
  // SIGN UP WITH USERNAME AND PASSWORD //
  ////////////////////////////////////////
  app.post('/auth/signup', (req, res, next) => {
    const { username, password } = req.body;
    return passport.authenticate('local-signup', err => {
      if (err) {
        if (err.code === 11000) {
          return res.status(409).json({
            success: false,
            message: 'Username is already taken.'
          });
        }

        return res.status(400).json({
          success: false,
          message: ''
        });
      }
      return res.status(200).json({
        success: true,
        message:
          'You have successfully signed up! Now you should be able to log in.'
      });
    })(req, res, next);
  });

  //////////////////////////////////////
  // LOGIN WITH USERNAME AND PASSWORD //
  //////////////////////////////////////
  app.post('/auth/login', async (req, res, next) => {
    return passport.authenticate('local-login', (err, token, userData) => {
      if (err) {
        if (
          err.name === 'IncorrectUsernameError' ||
          err.name === 'IncorrectPasswordError'
        ) {
          return res.status(400).send({
            success: false,
            message: err.message
          });
        }

        // return res.status(400).send({
        //   success: false,
        //   message: 'Could not process the form.'
        // });
      }

      return res.json({
        success: true,
        message: 'You have successfully logged in!',
        token,
        user: userData
      });
    })(req, res, next);
  });

  // ///////////////////////////////
  // // GET CURRENT USER FROM JWT //
  // ///////////////////////////////
  // app.get('/api/current_user', async (req, res) => {
  //   const token = req.headers.authorization.split(' ')[1];
  //   const decoded = jwt.verify(token, keys.jwtSecret);
  //   const userId = decoded.sub;

  //   const userData = await User.findById(userId);

  //   let user = null;
  //   if (userData) {
  //     const roomsOwned = [];
  //     for (const roomId of userData.roomsOwned) {
  //       const room = await Room.findById(roomId);
  //       if (room) {
  //         roomsOwned.push({ name: room.name, id: roomId });
  //       }
  //     }

  //     user = {
  //       id: userData.id,
  //       username: userData.username,
  //       roomsOwned
  //     };
  //   }

  //   res.send(user);
  // });

  // logout user with passport
  app.get('/api/logout', (req, res) => {
    req.logout();

    res.send();
  });
};
