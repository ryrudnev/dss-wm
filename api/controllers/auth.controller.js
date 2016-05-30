import jwt from 'jsonwebtoken';
import User, { NEW_ALLOWED_ATTRS } from '../models/user.model';
import { respondUnauthorized, respondError, respondOk } from '../util/expressUtils';
import { pick } from '../util/utils';
import config from '../core/config';

export function signup(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return respondUnauthorized.call(res, res.__('You must specify a username and password'));
  }
  const user = new User(pick(req.body, NEW_ALLOWED_ATTRS));
  user.save(err => {
    if (err) {
      return respondError.call(res, err);
    }
    respondOk.call(res, { user });
  });
}

export function auth(req, res) {
  const { username, password } = req.body;

  User.findOne({ username }).exec().then(user => {
    if (!user) {
      return respondUnauthorized.call(res, res.__('Authentication failed. User not found'));
    }

    user.comparePassword(password).then(() => {
      const iat = new Date().getTime() / 1000;
      const exp = iat + config.jwt.tokenExpirationTime;
      const payload = {
        aud: config.jwt.audience, iss: config.jwt.issuer,
        iat, exp,
        sub: user.username,
      };
      const token = jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.tokenExpirationTime,
      });
      respondOk.call(res, { token: `JWT ${token}`, user });
    }).catch(() => respondUnauthorized.call(res, res.__('Authentication failed. Wrong password')));
  }).catch(err => respondError.call(res, err));
}
