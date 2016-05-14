import passportJwt from 'passport-jwt';
import _debug from 'debug';
import User from '../models/user.model';
import { __ } from '../config/translations';
import appConfig from '../config/app.config';

const debug = _debug('api:passport');

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

    User.findOne({ username: jwtPayload.sub }).exec().then(user => {
      if (!user) {
        done(null, false, __('User not verified'));
      } else {
        done(null, user, __('User successfully verified'));
      }
    }).catch(err => {
      debug(`User verifying error: ${err}`);
      done(err, false);
    });
  }));

  return passport;
};
