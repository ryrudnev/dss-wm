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
      (a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []
  );
}

export function head(array, defaults = void 0) {
  if (!Array.isArray(array)) {
    return defaults;
  }
  return array[0] || defaults;
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
  return res => resp.status(res.code).json(res);
}
