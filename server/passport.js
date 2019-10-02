const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const LocalStrategy = require('passport-local');
const GooglePlusTokenStrategy = require('passport-google-plus-token');
const FacebookTokenStrategy = require('passport-facebook-token');

const User = require('./models/user');
const { JWT_SECRET, oauth } = require('./configuration');

// JSON WEB TOKENS STRATEGY
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromHeader('authorization'),
      secretOrKey: JWT_SECRET,
    },
    async (payload, done) => {
      try {
        // Find the user specified in token
        const user = await User.findById(payload.sub); // sub is id from jwt.
        // If user doesnt exist, handle it.
        if (!user) {
          return done(null, false);
        }
        // Otherwise, return the user.
        done(null, user);
      } catch (err) {
        done(err, false);
      }
    },
  ),
);

// GOOGLE OAUTH STRATEGY
passport.use(
  'googleToken',
  new GooglePlusTokenStrategy(
    {
      clientID: oauth.google.clientID,
      clientSecret: oauth.google.clientSecret,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('accessToken', accessToken);
        console.log('refreshToken', refreshToken);
        console.log('profile', profile);

        // Check weather this current user exist in our DB
        const existingUser = await User.findOne({ 'google.id': profile.id });
        if (existingUser) {
          console.log('User already exists in our DB');
          return done(null, existingUser);
        }

        console.log('User doesnt exist in our DB, create new one');

        // If new account
        const newUser = new User({
          method: 'google',
          google: {
            id: profile.id,
            email: profile.emails[0].value,
          },
        });

        await newUser.save();
        done(null, newUser);
      } catch (err) {
        done(err, false, err.message);
      }
    },
  ),
);

// FACEBOOK OAUTH STRATEGY
passport.use(
  'facebookToken',
  new FacebookTokenStrategy(
    {
      clientID: oauth.facebook.clientID,
      clientSecret: oauth.facebook.clientSecret,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('profile', profile);
        console.log('accessToken', accessToken);
        console.log('refreshToken', refreshToken);

        const existingUser = await User.findOne({ 'facebook.id': profile.id });
        if (existingUser) {
          return done(null, existingUser);
        }

        const newUser = new User({
          method: 'facebook',
          facebook: {
            id: profile.id,
            email: profile.emails[0].value,
          },
        });

        await newUser.save();
        done(null, newUser);
      } catch (err) {
        done(err, false, err.message);
      }
    },
  ),
);

// LOCAL STRATEGY
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
    },
    async (email, password, done) => {
      try {
        // Find the user given the email.
        const user = await User.findOne({ 'local.email': email });

        // If not, handle it.
        if (!user) {
          return done(null, false);
        }

        // Check if the password is correct.
        const isMatch = await user.isValidPassword(password);

        // If not, handle it.
        if (!isMatch) {
          return done(null, false);
        }

        // Otherwise, return the user.
        done(null, user);
      } catch (err) {
        done(err, false);
      }
    },
  ),
);
