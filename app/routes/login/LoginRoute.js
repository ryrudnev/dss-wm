import React from 'react';
import Helmet from 'react-helmet';
import radio from 'backbone.radio';
import { Route } from '../../core/router';
import Login from '../../components/Login';

const session = radio.channel('session');

export default class LoginRoute extends Route {
  authentication = false

  dashboard = false

  redirect() {
    return session.request('authorized') ? '' : false;
  }

  onSubmit(username, password) {
    session.request('login', { username, password });
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
