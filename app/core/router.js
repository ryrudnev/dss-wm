import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { Model, Collection } from 'backbone';
import { StateRouter, Route as BaseRoute } from './state-router';
import { applyFn } from '../util/utils';
import { each, isEmpty, findKey, isString, has } from 'underscore';
import radio from 'backbone.radio';

const router = radio.channel('router');
const session = radio.channel('session');
const errors = radio.channel('errors');

export class Route extends BaseRoute {}

export const NavLink = (props) => (
  <a
    {...props}
    href={props.uriFragment}
    className={classNames(props.className, 'nav-link')}
    onClick={() => router.request('navigate', props.uriFragment)}
  >
    {props.text || props.children}
  </a>
);
NavLink.propTypes = {
  uriFragment: PropTypes.string.isRequired,
  text: PropTypes.string,
};

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

    session.on('login', () => {
      const redirectFrom = session.request('get', 'redirectFrom');
      if (redirectFrom) {
        session.request('unset', 'redirectFrom');
        this.navigate(redirectFrom);
      } else { this.navigate(''); }
    });

    this.on({
      unauthorized: (route, routeData) => {
        session.request('set', 'redirectFrom', routeData.uriFragment);
        this.navigate('login');
      },
      route: (route, routeData) => router.trigger('route', route, routeData),
    });

    errors.on({
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
    return !(route.authorize !== false && !session.request('authorized'));
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
    const { routeOriginal, routeObject, parentRoute } = details;

    const uriFragment = this._getMappedUrl(routeOriginal, routeData);
    const text = applyFn.call(routeObject, 'breadcrumb', routeData);

    const b = new Model({ uriFragment, text });
    promises.push(Promise.resolve(text).then(
        t => b.set({ text: t })
    ));
    this.breadcrumb.unshift(b);

    if (parentRoute) {
      return this.createBreadcrumb(parentRoute, routeData, promises);
    }

    return promises;
  }

  _getMappedUrl(originalRoute, routeData) {
    if (!routeData) { return originalRoute; }
    const { params, queryString } = routeData;
    let url = originalRoute;
    each(params || {}, (v, k) => (url = url.replace(`:${k}`, v)));
    if (queryString) {
      url += (isEmpty(url) ? '/?' : '?') + queryString;
    }
    return url;
  }

  _routeDetails(route) {
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

export default (options) => {
  if (Router._created) { throw new Error('Router has already been created'); }
  Router._created = true;
  return new Router(options);
};
