import _debug from 'debug';
const debug = _debug('app:server');

export function qsParser() {
  return (req, res, next) => {
    if (req._qs) {
      next();
    }

    // query string params already parsed
    req._qs = true;

    const { query } = req;
    req.qs = Object.keys(query).reduce((cur, key) => {
      let val = query[key];
      if (typeof val === 'string') {
        const isJson = val.startsWith('{') || val.startsWith('[');
        if (isJson) {
          try {
            val = JSON.parse(val);
          } catch (e) {
            return cur;
          }
        }
      }
      cur[key] = val;
      return cur;
    }, {});

    next();
  };
}

export function respondOk(data) {
  const { code = 200, message = 'unknown' } = data;
  debug(`OK! Sent code ${code} and message '${message}'`);
  return this.status(code).json(data);
}

export function respondError(data) {
  const { code = 500, message = 'unknown' } = data;
  debug(`Error! Sent code ${code} and reason '${message}'`);
  return this.status(code).json(data);
}
