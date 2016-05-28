import $ from 'jquery';
import { history } from 'backbone';
import radio from 'backbone.radio';
import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from '../components';
import routes from './routes';
import initSession from './session';
import initRouter from './router';

const sessionChannel = radio.channel('session');
const routerChannel = radio.channel('router');
const errorChannel = radio.channel('errors');

class App {
  constructor() {
    this.errorHandler();

    routerChannel.on('route', () => this.render());
    errorChannel.on('error', error => this.render({ error }));

    initSession();

    initRouter({ routes });
  }

  errorHandler() {
    $(document).ajaxError((e, xhr) => {
      const resp = JSON.parse(xhr.responseText) || {};
      const { success, code, message } = resp;
      if (success) { return; }
      const error = { code: code || xhr.code, name: xhr.statusText, message };
      errorChannel.trigger(`error: ${error.code}`, error);
      errorChannel.trigger('error', error);
    });
  }

  render({ error } = {}) {
    ReactDOM.render(
      < AppContainer
        error={error}
        user={sessionChannel.request('currentUser')}
        breadcrumb={routerChannel.request('breadcrumb')}
        route={routerChannel.request('currentRoute')}
      />,
      document.getElementById('app')
    );
  }

  start() {
    history.start({ pushState: true });
  }
}

export default new App();
