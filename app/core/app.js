import Backbone from 'backbone';
import React from 'react';
import ReactDOM from 'react-dom';
import { App as AppComponent } from '../components';
import Session from './session';
import Router from './router';

export default class App {
  constructor() {
    this.session = new Session;
    this.router = new Router;

    this.router.on('route', this.onRoute.bind(this));
  }

  onRoute(route) {
    ReactDOM.render(
      <AppComponent
        page={route.render()}
        breadcrumbs={this.router.breadcrumbs}
      />,
      document.getElementById('app')
    );
  }

  start() {
    Backbone.history.start({ pushState: true });
  }
}
