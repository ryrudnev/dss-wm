import _debug from 'debug';

const debug = _debug('app:config');

const config = {
  env: process.env.NODE_ENV || 'development',

  // ----------------------------------
  // Server Configuration
  // ----------------------------------
  server_host: '0.0.0.0',
  server_port: process.env.PORT || 1337,

  // ----------------------------------
  // MongoDB Configuration
  // ----------------------------------
  mongodb_url: process.env.MONGO_URL || 'mongodb://localhost/wm-test',

  // ----------------------------------
  // Security Configuration
  // ----------------------------------
  secret: 'DSS-WM-secret',
  tokenExpirationTime: 60 * 20,
};

debug('Create configuration.');
debug(`Apply environment overrides for NODE_ENV "${config.env}".`);

export default config;
