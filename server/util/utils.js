export function isArray(obj) {
  return Array.isArray(obj);
}

export function isObject(obj) {
  return obj !== null && typeof obj === 'object';
}

export function isFunction(obj) {
  return !!(obj && obj.constructor && obj.call && obj.apply);
}

export function isBool(obj) {
  return typeof(obj) === 'boolean';
}

export class Deferred {
  constructor() {
    this.promise = new Promise((res, rej) => {
      this.resolve = res;
      this.reject = rej;
    });
  }
}

export function flatten(list) {
  return list.reduce(
      (a, b) => a.concat(isArray(b) ? flatten(b) : b), []
  );
}

export function arrayIndexOf(arr, val) {
  for (let i = 0; i < arr.length; i++) {
    const a = arr[i];
    if (a === val) {
      return i;
    }
    if (isObject(a) && isObject(val) && JSON.stringify(a) === JSON.stringify(val)) {
      return i;
    }
  }
  return -1;
}

// Intersection (a ∩ b): create a set that contains those elements of set a that are also in set b.
export function intersectSet(a, b) {
  return new Set([...a].filter(element => b.has(element)));
}

// Check if one set contains another (all members of a are in b).
export function containsSet(a, b) {
  return [...a].every(element => b.has(element));
}

// Set equality: a contains b, and b contains a
export function equalSet(a, b) {
  return a.size === b.size && containsSet(a, b);
}

// Get this key is equivalent of a Setmap structure
export function getEqualKeySetmap(setmap, key) {
  for (const k of setmap.keys()) {
    if (equalSet(k, key) === true) {
      return k;
    }
  }
  return null;
}

export function diffArray(a, b) {
  const flb = flatten([b]);
  return flatten([a]).filter(i => arrayIndexOf(flb, i) < 0);
}

export function unionArray(a, b) {
  return [...flatten([a]), ...diffArray(b, a)];
}

export function uniqueArray(arr) {
  const uniq = [];
  for (const a of flatten(arr)) {
    if (arrayIndexOf(uniq, a) < 0) {
      uniq.push(a);
    }
  }
  return uniq;
}

export function intersectArray(a, b) {
  const flb = flatten([b]);
  return flatten([a]).filter(i => ~arrayIndexOf(flb, i));
}

export function omit(object, ...keys) {
  if (!isObject(object)) {
    return {};
  }
  const res = {};
  for (const key of diffArray(Object.keys(object), keys)) {
    res[key] = object[key];
  }
  return res;
}

export function pick(object, ...keys) {
  if (!isObject(object)) {
    return {};
  }
  const res = {};
  for (const key of flatten([keys])) {
    if (key in object) {
      res[key] = object[key];
    }
  }
  return res;
}

export function joinExpanded(joinField, expanded, isSingle) {
  return expanded.reduce((cur, val) => {
    const item = val;
    const field = val[joinField];
    delete item[joinField];
    if (!isSingle) {
      if (!cur[field]) {
        cur[field] = [];
      }
      cur[field].push(item);
    } else {
      cur[field] = item;
    }
    return cur;
  }, {});
}

export function reject(rejected) {
  return new Promise((_, rej) => rej(rejected));
}

export function resolve(resolved) {
  return new Promise((res) => res(resolved));
}
