import { isFunction, isString } from 'underscore';

export function evaluatePath(obj, path) {
  const res = obj == null ? void 0 : (path || '').split('.').reduce((memo, i) => memo[i], obj);
  return res == null ? obj : res;
}

export function applyFn(fn, ...args) {
  const f = this == null ? void 0 : (isString(fn) ? evaluatePath(this, fn) : fn);
  return isFunction(f) ? f.apply(this, args) : f;
}
