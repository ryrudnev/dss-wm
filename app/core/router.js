import { Model, Collection } from 'backbone';
import { StateRouter, Route as BaseRoute } from './StateRouter';
import { applyFn } from '../util/utils';
import { each, isEmpty, findKey, isString, has } from 'underscore';
import { NotAuthorizedRoute, NotFoundRoute } from '../routes';
import radio from 'backbone.radio';

const router = radio.channel('router');
const session = radio.channel('session');
const errors = radio.channel('errors');

export class Route extends BaseRoute {}

class Router extends StateRouter {
  constructor(options) {
    super(options);
    this._attachEvents();

    this.breadcrumb = new Collection();
  }

  _attachEvents() {
    router.reply({
      navigate: uriFragment => this.navigate(uriFragment),

      breadcrumb: () => this.breadcrumb,

      currentRoute: () => this.currentRoute,

      currentRouteData: () => this.currentRouteData,
    });

    session.on('login', this.onLogin, this);

    this.on({
      unauthenticated: this.onUnauthenticated,
      unauthorized: this.onUnauthorized,

      'before:route': (route, routeData) => router.trigger('before:route', route, routeData),
      route: (route, routeData) => router.trigger('route', route, routeData),
    }, this);

    errors.on({
      'error:401': () => {
        const { originalRoute } = this._routeDetails(this.currentRoute);
        if (originalRoute !== 'login') {
          session.request('clear');
          this.navigate('login');
        }
      },
      'error:403': () => this.onUnauthorized(),
      'error:404': () => this.onNotFound(),
    });
  }

  authenticate(route /* , routeData */) {
    return !(route.authentication !== false && !session.request('authenticated'));
  }

  onLogin() {
    const redirectFrom = session.request('get', 'redirectFrom');
    if (redirectFrom) {
      session.request('unset', 'redirectFrom');
      this.navigate(redirectFrom);
    } else { this.navigate(''); }
  }

  onNotFound(route, routeData) {
    this.trigger('route', new NotFoundRoute, routeData || this.currentRouteData);
  }

  onUnauthorized(route, routeData) {
    this.trigger('route', new NotAuthorizedRoute, routeData || this.currentRouteData);
  }

  onUnauthenticated(route, routeData) {
    session.request('set', 'redirectFrom', routeData.uriFragment);
    this.navigate('login');
  }

  initBreadcrumb(route, routeData) {
    const { originalRoute } = routeData;
    this.breadcrumb.reset();

    if (route.breadcrumb) {
      return Promise.all(this._createBreadcrumb(originalRoute || route, routeData)).then(
          () => Promise.resolve(this.breadcrumb)
      );
    }

    return Promise.resolve(this.breadcrumb);
  }

  _createBreadcrumb(route, routeData, promises = [0]) {
    const details = this._routeDetails(route);
    if (!details) { return promises; }
    const { originalRoute, routeObject, parentRoute } = details;

    const url = this._getMappedUrl(originalRoute, routeData);
    const text = applyFn.call(routeObject, 'breadcrumb', routeData);

    const b = new Model({ url, text });
    promises.push(Promise.resolve(text).then(title => b.set({ text: title })));
    this.breadcrumb.unshift(b);

    if (parentRoute) { return this._createBreadcrumb(parentRoute, routeData, promises); }

    return promises;
  }

  _getMappedUrl(originalRoute, routeData) {
    if (!routeData) { return originalRoute; }
    const { params, queryString } = routeData;
    let url = `/${originalRoute}`;
    each(params || {}, (v, k) => (url = url.replace(`:${k}`, v)));
    if (queryString) { url += `?${queryString}`; }
    return url;
  }

  _routeDetails(route) {
    let originalRoute;
    if (route instanceof Route) {
      originalRoute = findKey(this.routes, linked =>
          linked === route || !(linked instanceof Route) && linked.uses === route
      );
    } else if (isString(route)) {
      originalRoute = has(this.routes, route) ? route :
          findKey(this.routes, linked => !(linked instanceof Route) && linked.as === route);
    } else { return false; }

    const linked = this.routes[originalRoute];
    const isLinked = linked instanceof Route;
    const routeObject = isLinked ? linked : linked.uses;
    if (originalRoute == null || routeObject == null) { return false; }

    return {
      originalRoute,
      routeObject,
      routeName: isLinked ? originalRoute : linked.as || originalRoute,
      parentRoute: isLinked ? void 0 : linked.parent,
    };
  }
}

export default (options) => {
  if (Router._created) { throw new Error('Router has already been created'); }
  Router._created = true;
  return new Router(options);
};
