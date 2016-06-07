import jwt from 'jsonwebtoken';
import User, { NEW_ALLOWED_ATTRS } from '../models/user.model';
import { respondUnauthorized, respondError, respondOk } from '../util/expressUtils';
import { pick } from '../util/utils';
import config from '../core/config';

export function genToken(username) {
  const iat = new Date().getTime() / 1000;
  const exp = iat + config.jwt.tokenExpirationTime;
  const payload = { aud: config.jwt.audience, iss: config.jwt.issuer, iat, exp, sub: username };
  return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.tokenExpirationTime });
}

export function signup(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return respondUnauthorized.call(res, res.__('You must specify a username and password'));
  }

  User.findOne({ username }).exec().then(user => {
    if (user) {
      return respondError.call(res, res.__('This an username already exists in the system'));
    }
    user = new User(pick(req.body, NEW_ALLOWED_ATTRS));
    user.save(() => respondOk.call(res, { data: user }));
  }).catch(err => respondError.call(res, err));
}

export function auth(req, res) {
  const { username, password } = req.body;

  User.findOne({ username }).exec().then(user => {
    if (!user) {
      return respondUnauthorized.call(res, res.__('Authentication failed. User not found'));
    }

    user.comparePassword(password).then(() => {
      const token = genToken(user.username);
      respondOk.call(res, { token: `JWT ${token}`, user });
    }).catch(() => respondUnauthorized.call(res, res.__('Authentication failed. Wrong password')));
  }).catch(err => respondError.call(res, err));
}

export function getUsers(req, res) {
  User.find({}).exec().then(users => {
    respondOk.call(res, { data: users });
  }).catch(err => respondError.call(res, err));
}

export function getUser(req, res) {
  User.findById(req.params.id).exec().then(user => {
    if (!user) {
      return respondError.call(res, res.__('Not found'));
    }
    respondOk.call(res, { data: user });
  }).catch(err => respondError.call(res, err));
}

export function updateUser(req, res) {
  User.findById(req.params.id).exec().then(user => {
    if (!user) {
      return respondError.call(res, res.__('Not found'));
    }
    const values = req.body;
    if (values.role) user.role = values.role;
    if (values.username) user.username = values.username;
    if (values.password) user.password = values.password;
    if (values.subjects) user.subjects = values.subjects;
    user.save(() => respondOk.call(res, { data: user }));
  }).catch(err => respondError.call(res, err));
}

export function deleteUser(req, res) {
  User.findById(req.params.id).exec().then(user => {
    if (!user) {
      return respondError.call(res, res.__('Not found'));
    }
    user.remove(() => respondOk.call(res, { data: null }));
  }).catch(err => respondError.call(res, err));
}

