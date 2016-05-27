import { Events } from 'backbone';
import BaseRouter from 'backbone.base-router';
import { applyFn } from '../util/utils';
import { isString, isFunction, flatten } from 'underscore';

export class Route extends Events {
  render(/* props, context */) {
    throw new Error('Method not implemented');
  }
/*
  fetch(routeData) {
    throw new Error('Method not implemented');
  }
*/
/*
  breadcrumb(routeData) {
    throw new Error('Method not implemented');
  }
*/
}

export class StateRouter extends BaseRouter {
  onNavigate(routeData) {
    let newRoute = routeData.linked;

    if (!(newRoute instanceof Route) && newRoute.uses) {
      newRoute = newRoute.uses;
    }
    if (!(newRoute instanceof Route)) {
      throw new Error('A Route object must be associated with each route.');
    }

    const redirect = applyFn.call(newRoute, 'redirect', routeData);
    if (isString(redirect)) {
      this.navigate(redirect, { trigger: true });
      newRoute.trigger('redirect', routeData);
      this.trigger('redirect', routeData);
      return;
    }

    if (isFunction(this.auth) && !this.auth(routeData)) {
      newRoute.trigger('unauthorized', routeData);
      this.trigger('unauthorized', routeData);
      return;
    }

    this.trigger('before:route', routeData);

    if (this.currentRoute) {
      this.currentRoute.trigger('exit', routeData);
    }
    this.currentRoute = newRoute;
    newRoute.trigger('enter', routeData);

    Promise.all([this.startBreadcrumb(), this.startFetch()]).then(() => {
      if (newRoute !== this.currentRoute) {
        return;
      }
      this.trigger('route', routeData);
    })
    .catch(error => {
      if (newRoute !== this.currentRoute) {
        return;
      }
      newRoute.trigger('error', error, routeData);
    });
  }

  startBreadcrumb(route, routeData) {
    if (isFunction(this.initBreadcrumb)) {
      this.trigger('before:breadcrumb');
      return Promise.resolve(this.initBreadcrumb(route, routeData)).then(b => {
        this.trigger('breadcrumb', b);
        return Promise.resolve(b);
      });
    }
    return 0;
  }

  startFetch(route, routeData) {
    if (isFunction(route.fetch)) {
      this.trigger('before:fetch');
      return Promise.all(flatten[route.fetch(routeData)]).then(data => {
        this.trigger('fetch', routeData, data);
        route.trigger('fetch', routeData, data);
        return Promise.resolve(data);
      });
    }
    return 0;
  }
}
