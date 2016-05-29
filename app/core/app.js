import { history } from 'backbone';
import radio from 'backbone.radio';
import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from '../components';
import routes from './routes';
import initSession from './session';
import initRouter from './router';
import initErrorHandler from './error-handler';

const session = radio.channel('session');
const router = radio.channel('router');

class App {
  constructor() {
    // rerender a new route
    router.on('route', () => this.render());

    // Start error handler
    initErrorHandler();

    // Start session
    initSession();

    // Start router
    initRouter({ routes });
  }

  render() {
    ReactDOM.render(
      < AppContainer
        user={session.request('currentUser')}
        breadcrumb={router.request('breadcrumb')}
        route={router.request('currentRoute')}
      />,
      document.getElementById('app')
    );
  }

  start() {
    history.start({ pushState: true });
  }
}

export default new App();
