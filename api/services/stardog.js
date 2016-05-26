import _debug from 'debug';
import { Deferred, wrapResolve } from '../util/utils';
import { Connection } from 'stardog';
import config from '../config/config';

const debug = _debug('api:stardog');

// Parse response form Stardog platform
export function parseStardogResponse(body, resp) {
  const res = {
    success: resp.statusCode < 400,
    code: resp.statusCode,
    message: resp.statusMessage,
  };

  if (!res.success) {
    return { ...res, data: body };
  }

  const { boolean, results } = body;

  if (boolean !== undefined) {
    return { ...res, data: { boolean } };
  }

  const { bindings } = results;
  return {
    ...res,
    data: bindings.map(b => Object.keys(b).reduce((r, val) => {
      const cur = r;
      cur[val] = b[val].value;
      return cur;
    }, {})) || [],
  };
}

function createDb(conn) {
  wrapResolve.call(conn, conn.createDB, config.stardog.newDbOptions)
    .then((body) => debug(body));
}

// Stardog connection wrapper
class Stardog {
  constructor() {
    const conn = this.conn = new Connection();
    conn.setReasoning(true);
    conn.setEndpoint(config.stardog.endpoint);
    conn.setCredentials(...config.stardog.credentials);

    this.database = config.stardog.database;
  }

  init() {
    const { conn, database } = this;

    return wrapResolve.call(conn, conn.listDBs, {})
      .then(body => {
        const { databases = [] } = body;
        if (databases.includes(database)) {
          return createDb(conn);
        }
      })
      .catch(err => debug(`Error ${err}`))
      .then(() => debug('Stardog successfully initialized'));
  }

  createDb(options = config.stardog.newDbOptions) {

  },

  removeDb(database = config.stardog.database) {

  },

  query(options, parseResult = parseStardogResponse) {
    const { conn, database } = this;

    debug(`Query to Stardog platform: ${options.query}`);

    const dfd = new Deferred();

    conn.query({ ...options, database },
      (body, resp) => {
        debug(`Response from Stardog platform: ${JSON.stringify(body)}`);
        const res = parseResult(body, resp);
        dfd[res.success ? 'resolve' : 'reject'](res);
      });
    return dfd.promise;
  }
}

export default new Stardog();
