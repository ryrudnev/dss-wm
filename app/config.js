import _debug from 'debug';
import apiConfig from '../api/core/config';

const debug = _debug('server:config');

const isProd = process.env.NODE_ENV === 'production';

const config = {
  env: process.env.NODE_ENV || 'development',

  isProd,

  host: process.env.HOST || 'localhost',
  port: process.env.PORT || (isProd ? 8080 : 3000),

  apiPort: process.env.API_PORT || apiConfig.server.port,
  // apiHost: process.env.API_HOST || 'localhost',

  // ----------------------------------
  // App Configuration
  // ----------------------------------
  app: {

  },
};

debug('Create server configuration.');
debug(`Apply environment overrides for NODE_ENV "${config.env}".`);

export default config;
