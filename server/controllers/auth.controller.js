import jwt from 'jsonwebtoken';
import User from '../models/user.model';
import appConfig from '../config/app.config';

export function signup(req, res) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(403).json({
      code: 403,
      success: false,
      message: 'Is necessary to specify a username and password',
      data: null,
    });
  }
  const user = new User({ username, password });
  user.save((err) => {
    if (err) {
      return res.status(500).json({
        code: 500,
        success: false,
        message: err,
        data: null,
      });
    }

    return res.status(200).json({
      code: 200,
      success: true,
      message: 'OK',
      data: user.toPublicJSON(),
    });
  });
}

export function auth(req, res) {
  const { username, password } = req.body;
  User.findOne({ username }, (findErr, user) => {
    if (findErr) {
      throw findErr;
    }

    if (!user) {
      return res.status(401).json({
        code: 401,
        success: false,
        message: 'Authentication failed. User not found',
        data: null,
      });
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
        return res.status(200).json({
          code: 200,
          success: true,
          message: 'OK',
          token: `JWT ${token}`,
          data: user.toPublicJSON(),
        });
      }

      return res.status(401).json({
        code: 401,
        success: false,
        message: 'Authentication failed. Wrong password',
        data: null,
      });
    });
  });
}
