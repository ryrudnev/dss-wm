import React from 'react';
import radio from 'backbone.radio';
import { Route } from '../../core/router';
import { Login } from '../../components';

const sessionChannel = radio.channel('session');

export default class LoginRoute extends Route{
  authorize = false

  dashboard = false

  redirect() {
    return sessionChannel.request('authorized') ? '' : false;
  }

  render(props) {
    return (
      <Login
        {...props}
        onSubmit={(credentials) => sessionChannel.request('login', credentials)}
      />
    );
  }
}
