import config from '../config';
import Stardog from 'stardog';

const stardog = new Stardog.Connection();
const query = stardog.query;

stardog.query = function stardogQuery(options, callback) {
  const defaults = {
    database: config.stardog.defaultDb,
    mimetype: 'application/ld+json',
  };
  return query.call(stardog, Object.assign({}, defaults, options), callback);
};

stardog.setReasoning(true);
stardog.setEndpoint(config.stardog.endpoint);
stardog.setCredentials(...config.stardog.credentials);

export default stardog;
