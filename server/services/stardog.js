import config from '../config';
import { Connection } from 'stardog';
import _ from 'lodash';

// Extract the name of axiom without prefix
export function axiomWithoutPrefix(axiom) {
  if (~axiom.indexOf(config.stardog.dbPrefix)) {
    return axiom.substring(axiom.lastIndexOf('#') + 1);
  }
  return axiom;
}

// Add prefix to the name of axiom
export function axiomWithPrefix(axiom) {
  if (!~axiom.indexOf(config.stardog.dbPrefix)) {
    return !~axiom.indexOf(':') ? `:${axiom}` : axiom;
  }

  return axiom;
}

// New stardog connection
const stardog = new Connection();

stardog.query = function stardogQuery(options, callback) {
  const opts = _.defaults({}, options, {
    database: config.stardog.dbName,
  });

  return Connection.prototype.query.call(this, opts, callback);
};

stardog._httpRequest = function stardogHttpRequest(options, callback) {
  const cb = (body, response) => {
    const result = {
      success: response.statusCode === 200,
      statusCode: response.statusCode,
      statusMsg: response.statusMessage,
      data: body,
    };

    if (callback) {
      callback(result, response);
    }
  };

  return Connection.prototype._httpRequest.call(this, options, cb);
};

// Execute a stardog query and send response as json
stardog.queryToRes = function stardogQueryToRes(options, res) {
  this.query(options, response => {
    const result = response;

    if (_.has(result, 'data.results.bindings')) {
      const data = _.map(result.data.results.bindings, b =>
        _.mapValues(b, be => axiomWithoutPrefix(be.value))
      );
      result.data = _.size(data) > 1 ? data : (_.head(data) || {});
    }

    return res.status(result.statusCode || 500).json(result);
  });
};

stardog.setReasoning(true);
stardog.setEndpoint(config.stardog.endpoint);
stardog.setCredentials(...config.stardog.credentials);

export default stardog;
