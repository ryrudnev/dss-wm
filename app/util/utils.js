import { isFunction, isString } from 'underscore';

export function evaluatePath(obj, path) {
  const parts = (path || '').split('.');
  const res = parts.reduce((memo, i) => memo[i], obj);
  return res === null ? obj : res;
}

export function applyFn(fn, ...args) {
  const f = isString(fn) ? evaluatePath(this, fn) : fn;
  return isFunction(f) ? f.apply(this, args) : f;
}
