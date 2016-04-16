import jwt from 'jwt-simple';
import User from '../models/user.model';
import appConfig from '../config/app.config';

export function signup(req, res) {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(403).json({
      code: 403,
      success: false,
      message: 'Enter the username and password',
    });
  } else {
    const user = new User({ username, password });
    user.save((err) => {
      if (err) {
        return res.status(500).json({
          code: 500,
          success: false,
          message: err,
        });
      }
      return res.status(200).json({
        code: 200,
        success: true,
        message: 'OK',
      });
    });
  }
}

export function authenticate(req, res) {
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
      });
    }

    user.comparePassword(password, (compareErr, isMatch) => {
      if (isMatch && !compareErr) {
        const iat = new Date().getTime() / 1000;
        const exp = iat + appConfig.tokenExpirationTime;
        const payload = { iat, exp, sub: user.username };
        const token = jwt.encode(payload, appConfig.secret);
        return res.status(200).json({
          code: 200,
          success: true,
          message: 'OK',
          token: `JWT ${token}`,
        });
      }
      return res.status(401).json({
        code: 401,
        success: false,
        message: 'Authentication failed. Wrong password',
      });
    });
  });
}
