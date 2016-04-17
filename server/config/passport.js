import passportJwt from 'passport-jwt';
import _debug from 'debug';
import User from '../models/user.model';
import appConfig from '../config/app.config';

const debug = _debug('app:passport');

const { Strategy, ExtractJwt } = passportJwt;

export default passport => {
  const options = {
    secretOrKey: appConfig.jwt.secret,
    jwtFromRequest: ExtractJwt.fromAuthHeader(),
    audience: appConfig.jwt.audience,
    issuer: appConfig.jwt.issuer,
  };

  passport.use(new Strategy(options, (jwtPayload, done) => {
    debug(`JWT payload: ${JSON.stringify(jwtPayload)}`);
    User.findOne({ username: jwtPayload.sub }, (err, user) => {
      if (err) {
        debug(`User verifying error: ${err}`);
        return done(err, false);
      }
      if (user) {
        return done(null, user, 'User successfully verified');
      }

      return done(null, false, 'User not verified');
    });
  }));
};
