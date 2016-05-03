import _debug from 'debug';
import { Deferred } from '../util/utils';
import { Connection } from 'stardog';
import appConfig from '../config/app.config';

const debug = _debug('app:stardog');

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

// Stardog connection wrapper
class Stardog {
  constructor() {
    const conn = this.connection = new Connection();
    conn.setReasoning(true);
    conn.setEndpoint(appConfig.stardog.endpoint);
    conn.setCredentials(...appConfig.stardog.credentials);
  }

  query(options, parseResult = parseStardogResponse) {
    debug(`Query to Stardog platform: ${options.query}`);

    const dfd = new Deferred();

    this.connection.query({ ...options, database: appConfig.stardog.dbName },
      (body, resp) => {
        debug(`Response from Stardog platform: ${JSON.stringify(body)}`);
        const res = parseResult(body, resp);
        dfd[res.success ? 'resolve' : 'reject'](res);
      });
    return dfd.promise;
  }
}

export default new Stardog();
