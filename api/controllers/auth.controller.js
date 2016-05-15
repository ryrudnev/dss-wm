import jwt from 'jsonwebtoken';
import User from '../models/user.model';
import { respondUnauthorized, respondError, respondOk } from '../util/expressUtils';
import apiConfig from '../config/api.config';

export function signup(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return respondUnauthorized.call(res, res.__('You must specify a username and password'));
  }
  const user = new User({ username, password });
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
      const exp = iat + apiConfig.jwt.tokenExpirationTime;
      const payload = {
        aud: apiConfig.jwt.audience, iss: apiConfig.jwt.issuer,
        iat, exp,
        sub: user.username,
      };
      const token = jwt.sign(payload, apiConfig.jwt.secret, {
        expiresIn: apiConfig.jwt.tokenExpirationTime,
      });
      respondOk.call(res, { token: `JWT ${token}`, user });
    }).catch(() => respondUnauthorized.call(res, res.__('Authentication failed. Wrong password')));
  }).catch(err => respondError.call(res, err));
}
