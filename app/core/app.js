import React from 'react';
import ReactDOM from 'react-dom';
import Progress from 'react-progress-2';
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
    router.on('before:route', () => {
      if (Progress.Component.instance) { Progress.show(); }
    });
    // rerender a new route
    router.on('route', route => {
      if (Progress.Component.instance) { Progress.hide(); }
      this.render({ route });
    });

    // Start error handler
    initErrorHandler();

    // Start session
    initSession();

    // Start router
    initRouter({ routes });
  }

  render({ route }) {
    ReactDOM.render(
      <div>
        <Progress.Component />
        < AppContainer
          user={session.request('currentUser')}
          breadcrumb={router.request('breadcrumb')}
          route={route || router.request('currentRoute')}
        />
      </div>,
      document.getElementById('app')
    );
  }

  start() {
    history.start({ pushState: true });
  }
}

export default new App();
