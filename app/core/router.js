import { Model, Collection } from 'backbone';
import { StateRouter, Route } from '../base/state-router';
import { applyFn } from '../util/utils';
import { each, isEmpty, findKey, isString, has } from 'underscore';
import radio from 'backbone.radio';

const routes = {

};

const routerChannel = radio.channel('router');
const sessionChannel = radio.channel('session');
const errorChannel = radio.channel('errors');

class Router extends StateRouter {
  constructor(options) {
    this.routes = options.routes;
    this.breadcrumb = new Collection();

    this.attachEvents();
  }

  attachEvents() {
    routerChannel.reply({
      inst: () => this,

      navigate: uriFragment => this.navigate(uriFragment),

      breadcrumb: () => this.breadcrumb,

      currentRoute: () => this.currentRoute,

      currentRouteData: () => this.currentRouteData,
    });

    sessionChannel.on('login', () => {
      const session = sessionChannel.request('inst');
      const redirectFrom = session.get('redirectFrom');
      if (redirectFrom) {
        session.unset('redirectFrom');
        this.navigate(redirectFrom);
      } else { this.navigate(''); }
    });

    this.on({
      unauthorized: (route, routeData) => {
        const session = sessionChannel.request('inst');
        session.set('redirectFrom', routeData.uriFragment);
        this.navigate('login');
      },
      route: (route, routeData) => routerChannel.trigger('route', route, routeData),
    });

    errorChannel.on({
      'error:401': () => {
        if (this.currentRouteData.originalRoute !== 'login') {
          this.navigate('login');
        }
      },
      'error:403': () => { /* */ },
      'error:404': () => this.navigate('*notfound'),
    });
  }

  authenticate(route /* , routeData */) {
    return !(route.authorize && !sessionChannel.request('authorized'));
  }

  initBreadcrumb(route, routeData) {
    const { originalRoute } = routeData;
    this.breadcrumb.reset();

    if (route.breadcrumb) {
      return Promise.all(this.createBreadcrumb(originalRoute || route, routeData)).then(
          () => Promise.resolve(this.breadcrumb)
      );
    }

    return Promise.resolve(this.breadcrumb);
  }

  createBreadcrumb(route, routeData, promises = [0]) {
    const details = this.routeDetails(route);
    if (!details) { return promises; }
    const { routeOriginal, routeObject, parentRoute } = details;

    const url = this.getMappedUrl(routeOriginal, routeData);
    const text = applyFn.call(routeObject, 'breadcrumb', routeData);

    const b = new Model({ url, text });
    promises.push(Promise.resolve(text).then(
        t => b.set({ text: t })
    ));
    this.breadcrumb.unshift(b);

    if (parentRoute) {
      return this.createBreadcrumb(parentRoute, routeData, promises);
    }

    return promises;
  }

  getMappedUrl(originalRoute, routeData) {
    if (!routeData) { return originalRoute; }
    const { params, queryString } = routeData;
    let url = originalRoute;
    each(params || {}, (v, k) => (url = url.replace(`:${k}`, v)));
    if (queryString) {
      url += (isEmpty(url) ? '/?' : '?') + queryString;
    }
    return url;
  }

  routeDetails(route) {
    let routeOriginal;
    if (route instanceof Route) {
      routeOriginal = findKey(this.routes, linked =>
          linked === route || !(linked instanceof Route) && linked.uses === route
      );
    } else if (isString(route)) {
      routeOriginal = has(this.routes, route) ? route :
          findKey(this.routes, linked => !(linked instanceof Route) && linked.as === route);
    } else { return false; }

    const linked = this.routes[routeOriginal];
    const isLinked = linked instanceof Route;
    const routeObject = isLinked ? linked : linked.uses;
    if (routeOriginal === void 0 || routeObject === void 0) { return false; }

    return {
      routeOriginal,
      routeObject,
      routeName: isLinked ? routeOriginal : linked.as || routeOriginal,
      parentRoute: isLinked ? void 0 : linked.parent,
    };
  }
}

export default new Router({ routes });
