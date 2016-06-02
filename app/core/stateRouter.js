import { Events, Model, Router, history } from 'backbone';
import { applyFn } from '../util/utils';
import {
  isString,
  isFunction,
  isArray,
  isRegExp,
  flatten,
  invoke,
  pick,
  object,
  zip,
  reduce,
} from 'underscore';

function Route(/* options */) {}
Object.assign(Route.prototype, {
  render(/* props, context */) {
    throw new Error('Method not implemented');
  },
  /*
   authorize(routeData) {
   }
  /*
   fetch(routeData) {
   },
   */
  /*
   breadcrumb(routeData) {
   },
   */
}, Events);
Route.extend = Model.extend;
export { Route };

const NAMED_PARAM = /(\(\?)?[:*]\w+/g;
const PLUS_SYMBOL = /\+/g;

export const StateRouter = Router.extend({
  constructor(...args) {
    this.routeParams = {};
    Router.prototype.constructor.apply(this, args);
  },

  route(origRoute, linked) {
    let route;
    let routeStr;

    if (isRegExp(origRoute)) {
      route = origRoute;
      routeStr = `${origRoute}`;
    } else {
      route = this._routeToRegExp(origRoute);
      routeStr = origRoute;
    }

    this.routeParams[origRoute] = invoke(routeStr.match(NAMED_PARAM), 'slice', 1);

    const routeData = { route, router: this, linked };

    if (!isRegExp(origRoute)) {
      routeData.originalRoute = origRoute;
    }

    history.route(route, (fragment, navOptions) => {
      const routeParams = this._extractParameters(route, fragment);
      const queryString = routeParams.pop();

      if (navOptions) { routeData.navOptions = navOptions; }
      routeData.queryString = queryString || undefined;
      routeData.query = this._getQueryParameters(queryString);
      routeData.params = this._getNamedParams(routeStr, routeParams);
      routeData.uriFragment = fragment;

      this.onNavigate(routeData);
    });

    return this;
  },

  _getNamedParams(route, routeParams) {
    if (!routeParams.length) { return {}; }

    const routeKeys = this.routeParams[route];
    const routeValues = routeParams.slice(0, routeKeys.length);

    return object(zip(routeKeys, routeValues));
  },

  _getQueryParameters(queryString) {
    if (!queryString) { return {}; }

    return reduce(queryString.split('&'), (memo, param) => {
      const parts = param.replace(PLUS_SYMBOL, ' ').split('=');
      let [key, val] = parts;

      key = decodeURIComponent(key);
      val = val === undefined ? null : decodeURIComponent(val);

      if (!memo[key]) {
        memo[key] = val;
      } else if (isArray(memo[key])) {
        memo[key].push(val);
      } else {
        memo[key] = [memo[key], val];
      }

      return memo;
    }, {});
  },

  navigate(uriFragment, options = {}) {
    if (applyFn.call(this.currentRoute, 'preventNavigation') !== true) {
      history.navigate(uriFragment, { ...options, trigger: true });
    }
    return this;
  },

  onNavigate(routeData) {
    let { linked } = routeData;

    if (!(linked instanceof Route) && linked.uses) {
      linked = linked.uses;
    }
    if (!(linked instanceof Route)) {
      throw new Error('A Route object must be associated with each route.');
    }

    routeData = pick(routeData, 'params', 'query', 'uriFragment');

    const redirect = applyFn.call(linked, 'redirect', routeData);
    if (isString(redirect)) {
      this.navigate(redirect, { trigger: true });
      linked.trigger('redirect', routeData);
      this.trigger('redirect', linked, routeData);
      return;
    }

    if (applyFn.call(this, 'authenticate', linked, routeData) === false) {
      linked.trigger('unauthenticated', routeData);
      this.trigger('unauthenticated', linked, routeData);
      return;
    }

    if (applyFn.call(linked, 'authorize', routeData) === false) {
      linked.trigger('unauthorized', routeData);
      this.trigger('unauthorized', linked, routeData);
      return;
    }

    this._transitioningTo = linked;

    this.trigger('before:route', linked, routeData);

    const promises = [
      this._startBreadcrumb(linked, routeData),
      this._startFetch(linked, routeData),
    ];

    Promise.all(promises).then(() => {
      if (this._transitioningTo !== linked) { return; }
      if (this.currentRoute) { this.currentRoute.trigger('exit'); }
      if (this._transitioningTo !== linked) { return; }

      this.currentRoute = linked;
      this.currentRouteData = routeData;
      linked.trigger('enter', routeData);

      if (this._transitioningTo === linked) { delete this._transitioningTo; }

      this.trigger('route', linked, routeData);
    })
    .catch(e => this.onError(e, routeData));
  },

  _startBreadcrumb(route, routeData) {
    if (isFunction(this.initBreadcrumb)) {
      this.trigger('before:breadcrumb');
      return Promise.resolve(this.initBreadcrumb(route, routeData)).then(b => {
        this.trigger('breadcrumb', b);
        return Promise.resolve(b);
      });
    }
    return 0;
  },

  _startFetch(route, routeData) {
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
  },

  onError(e /* , routeData */) {
    if (typeof console === 'object') {
      console.error(e, e.stack);
    }
    return this;
  },
});
