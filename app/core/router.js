import { Collection } from 'backbone';
import { StateRouter } from '../base/state-router';
import radio from 'backbone.radio';
import Session from './session';

const routerChannel = radio.channel('router');

export default class Router extends StateRouter {
  static channel = routerChannel;

  constructor() {
    this.breadcrumbs = new Collection();

    this.attachEvents();
  }

  attachEvents() {
    routerChannel.reply({
      instance: () => this,
      navigate: route => this.navigate(route, { trigger: true }),
      currentRoute: () => this.currentRoute,
    });
  }
}
