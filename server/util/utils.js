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
