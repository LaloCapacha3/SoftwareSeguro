import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User, { IUser } from '../models/userMod';  
import 'dotenv/config'; 
import { Error } from 'mongoose'; 
import jwt from 'jsonwebtoken';

require('dotenv').config();passport.serializeUser((user: IUser, done) => {
  done(null, user._id);  
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    console.error('Error al deserializar el usuario:', error);
    done(error, null);
  }
});

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_ID,
  clientSecret: process.env.GOOGLE_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK,
  scope: ['profile', 'email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;
    if (!email) {
      return done(new Error('Sin email de Google'), null);
    }

    let user = await User.findOne({ googleId: profile.id }) || await User.findOne({ email: email });

    if (!user) {
      user = new User({
        fullname: profile.displayName,
        username: email.split('@')[0],
        email: email,
        profilePicture: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : undefined,
        googleId: profile.id,
      });
      await user.save();
    }

    done(null, user); 
  } catch (err) {
    console.error('Error en la estrategia de Google:', err);
    done(err, null);
  }
}));

export default passport;