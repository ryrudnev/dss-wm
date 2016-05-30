import passportJwt from 'passport-jwt';
import User from '../models/user.model';
import { __ } from '../core/translations';
import config from './config';

const { Strategy, ExtractJwt } = passportJwt;

export default passport => {
  const options = {
    secretOrKey: config.jwt.secret,
    jwtFromRequest: ExtractJwt.fromAuthHeader(),
    audience: config.jwt.audience,
    issuer: config.jwt.issuer,
  };

  passport.use(new Strategy(options, (jwtPayload, done) => {
    User.findOne({ username: jwtPayload.sub }).exec().then(user => {
      if (!user) {
        done(null, false, __('User not verified'));
      } else {
        done(null, user, __('User successfully verified'));
      }
    }).catch(err => {
      done(err, false);
    });
  }));

  return passport;
};
