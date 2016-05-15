import _debug from 'debug';

const debug = _debug('server:config');

const isProd = process.env.NODE_ENV === 'production';

const config = {
  env: process.env.NODE_ENV || 'development',

  isProd,

  host: process.env.HOST || 'localhost',
  port: process.env.PORT || (isProd ? 80 : 3000),

  apiHost: process.env.API_HOST || 'localhost',
  apiPort: process.env.API_PORT || 1337,

  app: {

  },
};

debug('Create server configuration.');
debug(`Apply environment overrides for NODE_ENV "${config.env}".`);

export default config;
