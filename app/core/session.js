import { Model, $ } from 'backbone';
import radio from 'backbone.radio';
import store from 'store';
import { Model as User } from '../entities/user';
import { pick, result, isFunction } from 'underscore';

const sessionChannel = radio.channel('session');

function onError(resp, error) {
  if (!resp.success) {
    const msg = resp.message || resp;
    sessionChannel.trigger('error', msg);
    if (isFunction(error)) {
      error(msg);
    }
  }
}

class Session extends Model {
  constructor(options) {
    super(options);
    this.attachEvents();

    this.user = new User();
    this.updateUser();

    if (this.isAuth()) {
      sessionChannel.trigger('authorize', this.user);
    }
  }

  attachEvents() {
    sessionChannel.reply({
      inst: () => this,

      authorized: this.isAuth,

      token: () => this.get('token'),

      currentUser: () => this.user,

      sigin: this.sigin,

      logout: this.logout,

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

  isAuth() {
    return !!this.get('token');
  }

  sigin({ username, password }, { success, error } = {}) {
    return $.ajax({
      xhrFields: { withCredentials: true },
      contentType: 'application/json',
      type: 'POST',
      url: `${this.url()}/token`,
      data: { username, password },
    }).done(resp => {
      if (resp.success) {
        this.updateUser(resp.user);
        this.set('token', resp.token);
        sessionChannel.trigger('authorize', this.user);
        if (isFunction(success)) {
          success(resp);
        }
      } else {
        onError(resp, error);
      }
    }).fail(resp => onError(resp, error));
  }

  signup(data, { success, error } = {}) {
    return $.ajax({
      xhrFields: { withCredentials: true },
      contentType: 'application/json',
      type: 'POST',
      url: `${this.url()}/signup`,
      headers: { Authorization: this.get('token') },
      data,
    }).done(resp => {
      if (resp.success) {
        if (isFunction(success)) {
          success(resp);
        }
      } else {
        onError(resp, error);
      }
    }).fail(resp => onError(resp, error));
  }

  logout() {
    this.clear();
    sessionChannel.trigger('logout');
  }
}

export default new Session();
