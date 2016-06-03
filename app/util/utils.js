import { isFunction, isString, isObject, isArray } from 'underscore';

export function evaluatePath(obj, path) {
  const res = obj == null ? void 0 : (path || '').split('.').reduce((memo, i) => memo[i], obj);
  return res == null ? obj : res;
}

export function applyFn(fn, ...args) {
  const f = this == null ? void 0 : (isString(fn) ? evaluatePath(this, fn) : fn);
  return isFunction(f) ? f.apply(this, args) : f;
}

export function isPlainObject(obj) {
  return isObject(obj) && !isFunction(obj) && !isArray(obj);
}

export function tryParseJson(str) {
  if (!isString(str)) return str;
  let res;
  try {
    res = JSON.parse(str);
  } catch (e) {
    res = str;
  }
  return res;
}

export class Deferred {
  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}
