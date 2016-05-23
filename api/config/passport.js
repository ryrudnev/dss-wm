import passportJwt from 'passport-jwt';
import _debug from 'debug';
import User from '../models/user.model';
import { __ } from '../config/translations';
import apiConfig from './api.config';

const debug = _debug('api:passport');

const { Strategy, ExtractJwt } = passportJwt;

export default passport => {
  const options = {
    secretOrKey: apiConfig.jwt.secret,
    jwtFromRequest: ExtractJwt.fromAuthHeader(),
    audience: apiConfig.jwt.audience,
    issuer: apiConfig.jwt.issuer,
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