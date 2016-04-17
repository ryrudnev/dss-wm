import _debug from 'debug';
const debug = _debug('app:server');

export function isArray(object) {
  return Array.isArray(object);
}

export function isObject(object) {
  return object !== null && typeof object === 'object';
}

export class Deferred {
  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.reject = reject;
      this.resolve = resolve;
    });
  }
}

export function flatten(list) {
  return list.reduce(
      (a, b) => a.concat(isArray(b) ? flatten(b) : b), []
  );
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

export function head(array, defaults = void 0) {
  if (!isArray(array)) {
    return defaults;
  }
  return array[0] || defaults;
}

export function diff(a, b) {
  return a.filter(i => b.indexOf(i) < 0);
}

export function omit(object, ...keys) {
  if (!isObject(object)) {
    return {};
  }
  const res = {};
  for (const key of diff(Object.keys(object), flatten([keys]))) {
    res[key] = object[key];
  }
  return res;
}

export function pluck(object, ...keys) {
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

export function qsToJson({ query }) {
  return Object.keys(query).reduce((res, val) => {
    const cur = res;
    let value = query[val];
    if (typeof value === 'string') {
      const isJson = value.startsWith('{') || value.startsWith('[');
      if (isJson) {
        try {
          value = JSON.parse(value);
        } catch (e) {
          return cur;
        }
      }
    }
    cur[val] = value;
    return cur;
  }, {});
}

export function joinExpanded(joinField, expanded, isSingle) {
  return expanded.reduce((prev, val) => {
    const cur = prev;
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

export function onSendResp(resp) {
  return res => {
    if (res instanceof Error) {
      debug(res);
      return resp.status(500).send(JSON.stringify(res));
    }
    debug(`The server sent response with ${res.code} code and message '${res.message}'`);
    return resp.status(res.code).json(res);
  };
}

export function onError(res) {
  return new Promise((resolve, reject) => reject(res));
}
