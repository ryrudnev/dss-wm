const isProd = process.env.NODE_ENV === 'production';

const config = {
  env: process.env.NODE_ENV || 'development',

  host: process.env.HOST || 'localhost',
  port: process.env.PORT || (isProd ? 8080 : 3000),

  apiPort: process.env.API_PORT || 3001,
  // apiHost: process.env.API_HOST || 'localhost',

  // ----------------------------------
  // App Configuration
  // ----------------------------------
  app: {

  },
};

export default config;
