import React from 'react';
import ReactDOM from 'react-dom';
import AppContainer from '../components/AppContainer';
import routes from './routes';
import { history } from 'backbone';
import radio from 'backbone.radio';
import initSession from './session';
import initRouter from './router';
import initErrorHandler from './errorHandler';

const session = radio.channel('session');
const router = radio.channel('router');

class App {
  constructor() {
    // rerender a new route
    router.on('route', route => this.render({ route }));

    // Start error handler
    initErrorHandler();

    // Start session
    initSession();

    // Start router
    initRouter({ routes });
  }

  render({ route }) {
    ReactDOM.render(
      < AppContainer
        user={session.request('currentUser')}
        breadcrumb={router.request('breadcrumb')}
        route={route || router.request('currentRoute')}
      />,
      document.getElementById('app')
    );
  }

  start() {
    history.start({ pushState: true });
  }
}

export default new App();
