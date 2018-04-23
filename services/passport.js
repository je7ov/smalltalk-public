const passport = require('passport');
const googleStrategy = require('passport-google-oauth20').Strategy;
const localStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const keys = require('../config/keys');

const User = mongoose.model('users');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then(user => done(null, user));
});

passport.use(
  new googleStrategy(
    {
      clientID: keys.googleClientID,
      clientSecret: keys.googleClientSecret,
      callbackURL: '/auth/google/callback',
      proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {
      const existingUser = await User.findOne({ googleId: profile.id });
      if (existingUser) {
        console.log(existingUser);
        return done(null, existingUser);
      }
      const user = await new User({ googleId: profile.id }).save();
      console.log(user);
      done(null, user);
    }
  )
);

// passport.use(
//   new localStrategy(async (username, password, done) => {
//     const user = await User.findOne({ username });
//     if (!user) {
//       return done(null, false, { message: 'Incorrect username' });
//     }

//     if (!user.validPassword(password)) {
//       return done(null, false, { message: 'Incorrect password' });
//     }

//     return done(null, user);
//   })
// );
