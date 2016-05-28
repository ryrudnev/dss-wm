import { Events, history } from 'backbone';
import BaseRouter from 'backbone.base-router';
import { applyFn } from '../util/utils';
import { isString, isFunction, flatten, pick } from 'underscore';

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
  navigate(uriFragment, options = {}) {
    if (applyFn.call(this.currentRoute, 'preventNavigation') !== true) {
      history.navigate(uriFragment, { ...options, trigger: true });
    }
    return this;
  }

  onNavigate(routeData) {
    let { linked } = routeData;

    if (!(linked instanceof Route) && linked.uses) {
      linked = linked.uses;
    }
    if (!(linked instanceof Route)) {
      throw new Error('A Route object must be associated with each route.');
    }

    routeData = pick(routeData, 'params', 'query', 'uriFragment', 'originalRoute');

    const redirect = applyFn.call(linked, 'redirect', routeData);
    if (isString(redirect)) {
      this.navigate(redirect, { trigger: true });
      linked.trigger('redirect', routeData);
      this.trigger('redirect', linked, routeData);
      return;
    }

    if (isFunction(this.authenticate) && !this.authenticate(linked, routeData)) {
      linked.trigger('unauthorized', routeData);
      this.trigger('unauthorized', linked, routeData);
      return;
    }

    this._transitioningTo = linked;

    this.trigger('before:route', linked, routeData);

    const promises = [this.startBreadcrumb(linked, routeData), this.startFetch(linked, routeData)];
    Promise.all(promises).then(() => {
      if (this._transitioningTo !== linked) { return; }

      if (this.currentRoute) {
        this.currentRoute.trigger('exit');
      }
      if (this._transitioningTo !== linked) { return; }

      this.currentRoute = linked;
      this.currentRouteData = routeData;
      linked.trigger('enter', routeData);

      if (this._transitioningTo === linked) {
        delete this._transitioningTo;
      }

      this.trigger('route', linked, routeData);
    })
    .catch(e => {
      if (isFunction(linked.onError)) {
        linked.onError(e, routeData);
      } else {
        this.onError(e, routeData);
      }
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
        if (this._transitioningTo !== route) { return; }

        this.trigger('fetch', route, routeData, data);
        route.trigger('fetch', routeData, data);
        return Promise.resolve(data);
      });
    }
    return 0;
  }

  onError(e /* , routeData */) {
    if (typeof console === 'object') {
      console.error(e, e.stack);
    }
    return this;
  }
}
