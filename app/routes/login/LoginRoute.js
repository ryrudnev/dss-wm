import React from 'react';
import Helmet from 'react-helmet';
import radio from 'backbone.radio';
import { Route } from '../../core/router';
import { Login } from '../../components';

const session = radio.channel('session');
const errors = radio.channel('errors');

export default class LoginRoute extends Route {
  authorize = false

  dashboard = false

  redirect() {
    return session.request('authorized') ? '' : false;
  }

  onSubmit(username, password) {
    session.request('login', { username, password });
  }

  onError(handler) {
    errors.on('error', handler);
  }

  render(props) {
    return (
      <div>
        <Helmet title="Вход в систему" />
        <Login {...props} onSubmit={this.onSubmit} onError={this.onError} />
      </div>
    );
  }
}
