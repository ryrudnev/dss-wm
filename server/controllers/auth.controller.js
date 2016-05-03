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
    user.calcPermissions().then(({ scopes, roles }) => {
      respondOk.call(res, { user: { ...user.toJSON(), scopes, roles } });
    });
  });
}

export function auth(req, res) {
  const { username, password } = req.body;

  User.findOne({ username }).exec().then(user => {
    if (!user) {
      return respondUnauthorized.call(res, 'Authentication failed. User not found');
    }

    user.comparePassword(password).then(() => {
      const iat = new Date().getTime() / 1000;
      const exp = iat + appConfig.jwt.tokenExpirationTime;
      const payload = {
        aud: appConfig.jwt.audience, iss: appConfig.jwt.issuer,
        iat, exp,
        sub: user.username,
      };
      const token = jwt.sign(payload, appConfig.jwt.secret, {
        expiresIn: appConfig.jwt.tokenExpirationTime,
      });

      user.calcPermissions().then(({ scopes, roles }) => {
        respondOk.call(res, { token: `JWT ${token}`, user: { ...user.toJSON(), scopes, roles } });
      });
    }).catch(() => respondUnauthorized.call(res, 'Authentication failed. Wrong password'));
  }).catch(err => respondError.call(res, err));
}

export function getPermissions(req, res) {
  respondOk.call(res, { data: req.user.permissions });
}
