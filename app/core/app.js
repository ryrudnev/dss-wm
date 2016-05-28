import { history, $ } from 'backbone';
import radio from 'backbone.radio';
import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from '../components';

import './session';
import './router';

const sessionChannel = radio.channel('session');
const routerChannel = radio.channel('router');
const errorChannel = radio.channel('errors');

class App {
  constructor() {
    this.errorHandler();

    routerChannel.on('route', () => this.render());
    errorChannel.on('error', error => this.render({ error }));
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

  render({ error }) {
    const route = routerChannel.request('currentRoute');
    const routeData = routerChannel.request('currentRouteData');
    const breadcrumb = routerChannel.request('breadcrumb');
    const user = sessionChannel.request('currentUser');

    ReactDOM.render(
      < AppContainer
        error={error}
        user={user}
        routeData={routeData}
        breadcrumb={breadcrumb}
        Page={(props, context) => route.render(props, context)}
      />,
      document.getElementById('app')
    );
  }

  start() {
    history.start({ pushState: true });
  }
}

export default new App();
