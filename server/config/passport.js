import passportJwt from 'passport-jwt';
import User from '../models/user.model';
import appConfig from '../config/app.config';

export default passport => {
  // Configure Passport authenticated session persistence.
  //
  // In order to restore authentication state across HTTP requests, Passport needs
  // to serialize users into and deserialize users out of the session.  The
  // typical implementation of this is as simple as supplying the user ID when
  // serializing, and querying the user record by ID from the database when
  // deserializing.
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });

  const options = {
    secretOrKey: appConfig.secret,
    jwtFromRequest: passportJwt.ExtractJwt.fromAuthHeader(),
  };

  passport.use(new passportJwt.Strategy(options, (jwtPayload, done) => {
    User.findOne({ username: jwtPayload.sub }, (err, user) => {
      if (err) {
        return done(err, false);
      }
      if (user) {
        done(null, user);
      } else {
        done(null, false, 'User not found in token');
      }
    });
  }));
};
