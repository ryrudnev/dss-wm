import _debug from 'debug';

const debug = _debug('app:config');

const config = {
  env: process.env.NODE_ENV || 'development',

  // ----------------------------------
  // Server Configuration
  // ----------------------------------
  server: {
    host: '0.0.0.0',
    port: process.env.PORT || 1337,
  },

  // ----------------------------------
  // MongoDB Configuration
  // ----------------------------------
  mongodb: {
    url: process.env.MONGO_URL || 'mongodb://localhost/wm-test',
  },

  // ----------------------------------
  // Security Configuration
  // ----------------------------------
  jwt: {
    secret: 'DSS-WM-secret',
    tokenExpirationTime: 60 * 60,
    audience: 'http://localhost:1337',
    issuer: 'admin@dsswm.me',
  },

  // ----------------------------------
  // Stardog platform Configuration
  // ----------------------------------
  stardog: {
    endpoint: process.env.STARDOG_ENDPOINT || 'http://localhost:5820/',
    credentials: ['admin', 'admin'],
    dbName: process.env.STARDOG_DB || 'wm-test',
  },
};

debug('Create configuration.');
debug(`Apply environment overrides for NODE_ENV "${config.env}".`);

export default config;
