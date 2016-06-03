import Backbone, { Collection as BaseCollection } from 'backbone';
import radio from 'backbone.radio';
import 'backbone-associations';
import { isFunction, isString, isArray, has, flatten, union } from 'underscore';
import { words } from 'underscore.string';
import { applyFn, isPlainObject } from '../util/utils';
import config from '../config';

const { AssociatedModel } = Backbone;

const sessionChannel = radio.channel('session');

function syncMixin(proto) {
  return {
    apiUrl() {
      return `http://localhost:${config.apiPort}/api`;
    },

    sync(method, modelOrCollection, options = {}) {
      const token = sessionChannel.request('token');
      Object.assign(options, { headers: { Authorization: token } });
      return proto.sync.call(this, method, modelOrCollection, options);
    },
  };
}

function fetchMixin(proto) {
  return {
    queryParams: {},

    getParam(param) {
      return this.queryParams[param] || null;
    },

    setParam(param, val) {
      if (isFunction(val)) { val = val(this.getParam(param)); }
      this.queryParams[param] = val;
      return this;
    },

    deleteParam(param) {
      if (param == null) {
        this.queryParams = {};
      } else { delete this.queryParams[param]; }
      return this;
    },

    _defineParam(param, value, options = {}) {
      if (value == null) { return this.getParam(param); }
      const newValue = isString(value) ? words(value, ',') : value;
      return this.setParam(param, options.merge ?
        oldValue => {
          if (isPlainObject(oldValue) || isPlainObject(newValue)) {
            return { ...(oldValue || {}), ...newValue };
          }
          if (oldValue == null) return newValue;
          return union(flatten([oldValue || []]), flatten([newValue]));
        } : newValue);
    },

    fillableParams() {
      throw new Error('Method not implemented');
    },

    fillQueryParams(options = {}) {
      options.mergeParams = options.mergeParams || true;
      for (const param of applyFn.call(this, 'fillableParams')) {
        if (has(options, param) && isFunction(this[`${param}Param`])) {
          this[`${param}Param`](options[param], { merge: options.mergeParams });
        }
      }
      return this;
    },

    fetch(options = {}) {
      this.fillQueryParams(options);
      options.data = { ...this.queryParams, ...(options.data || {}) };
      return proto.fetch.call(this, options);
    },

    expandParam(list, options = {}) {
      return this._defineParam('expand', list, { merge: true, ...options });
    },
  };
}


export const Model = AssociatedModel.extend({
  ...syncMixin(AssociatedModel.prototype),

  ...fetchMixin(AssociatedModel.prototype),

  fillableParams: ['expand'],

  parse(resp) {
    return ('success' in resp && 'data' in resp) ? resp.data || {} : resp;
  },
});

export const Collection = BaseCollection.extend({
  ...syncMixin(BaseCollection.prototype),

  ...fetchMixin(BaseCollection.prototype),

  fillableParams: ['expand', 'sort', 'limit', 'offset', 'subtypes'],

  parse(resp) {
    return ('success' in resp && 'data' in resp) ? flatten([resp.data || []]) : isArray(resp) || [];
  },

  sortParam(list, options = {}) {
    return this._defineParam('sort', list, { merge: true, ...options });
  },

  limitParam(value) {
    return this._defineParam('limit', value);
  },

  offsetParam(value) {
    return this._defineParam('offset', value);
  },

  subtypesParam(list, options = {}) {
    return this._defineParam('subtypes', list, { merge: true, ...options });
  },
});
