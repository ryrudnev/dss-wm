import _debug from 'debug';
import { Deferred } from '../util/utils';
import { Connection } from 'stardog';
import config from '../core/config';

const debug = _debug('api');

// Parse response form Stardog platform
export function parseStardogResponse(body, resp) {
  const res = {
    success: resp.statusCode < 400,
    code: resp.statusCode,
    message: resp.statusMessage,
  };

  if (!res.success) { return { ...res, data: body }; }

  const { boolean, results } = body;

  if (boolean != null) { return { ...res, data: { boolean } }; }

  return {
    ...res,
    data: results.bindings.map(b => Object.keys(b).reduce((r, val) => {
      r[val] = b[val].value;
      return r;
    }, {})) || [],
  };
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

  checkDb() {
    return this.listDbs().then(databases => {
      if (!databases.includes(this.database)) { return this.createDb(); }
      if (process.env.NODE_ENV !== 'test') { return Promise.resolve(true); }
      return this.removeDb().then(() => this.createDb());
    }).then(() => debug('Stardog successfully connected on db!'));
  }

  listDbs() {
    const { conn } = this;
    const dfd = new Deferred();
    conn.listDBs({}, (body, resp) => {
      if (!(resp.statusCode < 400)) {
        return dfd.reject(body);
      }
      dfd.resolve(body.databases);
    });
    return dfd.promise;
  }

  createDb(options = {}) {
    const { conn } = this;
    const dfd = new Deferred();
    conn.createDB({ ...config.stardog.newDbOptions, ...options }, (body, resp) => {
      if (!(resp.statusCode < 400)) {
        return dfd.reject(body);
      }
      dfd.resolve(body);
    });
    return dfd.promise;
  }

  removeDb(dbname) {
    const { conn, database } = this;
    const dfd = new Deferred();
    conn.dropDB({ database: dbname || database }, (body, resp) => {
      if (!(resp.statusCode < 400)) {
        return dfd.reject(body);
      }
      dfd.resolve(body);
    });
    return dfd.promise;
  }

  query(options, parseResult = parseStardogResponse) {
    debug(`Query to Stardog platform: ${options.query}`);

    const { conn, database } = this;
    const dfd = new Deferred();
    conn.query({ ...options, database }, (body, resp) => {
      debug(`Response from Stardog platform: ${JSON.stringify(body)}`);
      const res = parseResult(body, resp);
      dfd[res.success ? 'resolve' : 'reject'](res);
    });
    return dfd.promise;
  }
}

export default new Stardog();
