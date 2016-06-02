import $ from 'jquery';
import { Model } from 'backbone';
import radio from 'backbone.radio';
import store from 'store';
import { Model as User } from '../entities/User';
import { pick, result, isFunction } from 'underscore';

const session = radio.channel('session');

function onError(resp, error) {
  if (!resp.success) {
    const msg = resp.message || resp;
    session.trigger('error', msg);
    if (isFunction(error)) {
      error(msg);
    }
  }
}

class Session extends Model {
  constructor(options) {
    super(options);
    this._attachEvents();

    this.user = new User();
    this.user.isAuth = () => !!this.get('token');
    this.updateUser();
  }

  _attachEvents() {
    session.reply({
      set: (key, value) => this.set(key, value),

      get: (key) => this.get(key),

      unset: (key) => this.unset(key),

      authenticated: () => !!this.get('token'),

      token: () => this.get('token'),

      currentUser: () => this.user,

      clear: () => this.clear(),

      login: this.login,

      signup: this.signup,
    }, this);
  }

  url() {
    return '/api/auth';
  }

  get(key) {
    return store.get(key);
  }

  set(key, val) {
    store.set(key, val);
    return this;
  }

  unset(key) {
    store.remove(key);
    return this;
  }

  clear() {
    store.clear();
    this.updateUser();
    this.trigger('clear');
    return this;
  }

  updateUser(userData = undefined) {
    if (userData) {
      const attrs = Object.keys(result(this.user, 'defaults', {}));
      this.set('userData', pick(userData, attrs));
    }
    return this.user.clear().set(this.get('userData'));
  }

  login(credentials, { success, error } = {}) {
    return $.post(`${this.url()}/token`, credentials).done(resp => {
      if (resp.success) {
        this.updateUser(resp.user);
        this.set('token', resp.token);
        session.trigger('login', this.user);
        if (isFunction(success)) {
          success(resp);
        }
      } else {
        onError(resp, error);
      }
    }).fail(resp => onError(resp, error));
  }

  signup(data, { success, error } = {}) {
    return $.post({ url: `${this.url()}/signup`, data,
      headers: { Authorization: this.get('token') },
    }).done(resp => {
      if (resp.success) {
        session.trigger('signup', resp.user);
        if (isFunction(success)) {
          success(resp);
        }
      } else {
        onError(resp, error);
      }
    }).fail(resp => onError(resp, error));
  }
}

export default (options) => {
  if (Session._created) { throw new Error('Session has already been created'); }
  Session._created = true;
  return new Session(options);
};
