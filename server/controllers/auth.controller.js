import jwt from 'jsonwebtoken';
import User from '../models/auth/user.model';
import { respondUnauthorized, respondError, respondOk } from '../util/expressUtils';
import appConfig from '../config/app.config';

export function signup(req, res) {
  const { username, password } = req.body;
  if (!username || !password) {
    return respondUnauthorized.call(res, 'Is necessary to specify a username and password');
  }

  const user = new User({ username, password });
  user.save(err => {
    if (err) {
      return respondError.call(res, err);
    }
    respondOk.call(res, { user: user.toPublicJSON() });
  });
}

export function auth(req, res) {
  const { username, password } = req.body;
  User.findOne({ username }).exec()
      .then(user => {
        if (!user) {
          return respondUnauthorized.call(res, 'Authentication failed. User not found');
        }
        user.comparePassword(password, (compareErr, isMatch) => {
          if (isMatch && !compareErr) {
            const iat = new Date().getTime() / 1000;
            const exp = iat + appConfig.jwt.tokenExpirationTime;
            const payload = {
              aud: appConfig.jwt.audience,
              iss: appConfig.jwt.issuer,
              iat,
              exp,
              sub: user.username,
            };
            const token = jwt.sign(payload, appConfig.jwt.secret, {
              expiresIn: appConfig.jwt.tokenExpirationTime,
            });
            return respondOk.call(res, { token: `JWT ${token}`, user: user.toPublicJSON() });
          }
          respondUnauthorized.call(res, 'Authentication failed. Wrong password');
        });
      }).catch(err => respondError.call(res, err));
}
