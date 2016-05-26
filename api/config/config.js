import path from 'path';

export default {
  env: process.env.NODE_ENV || 'development',

  // Log path
  logPath: path.resolve(__dirname, '../../logs/api.log'),

  // ----------------------------------
  // Localizations Configuration
  // ----------------------------------
  translations: {
    // setup some locales - other locales default to en silently
    locales: ['en', 'ru'],

    // default locale
    defaultLocale: 'en',

    extension: '.json',

    // query parameter to switch locale (ie. /home?lang=ch) - defaults to NULL
    queryParameter: 'lang',

    // where to store json files - defaults to './locales' relative to modules directory
    directory: path.resolve(__dirname, 'locales'),
  },

  // ----------------------------------
  // Server Configuration
  // ----------------------------------
  server: {
    port: process.env.API_PORT || 1337,
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
    tokenExpirationTime: 24 * 60 * 60,
    audience: 'http://localhost:1337',
    issuer: 'admin@dsswm.me',
  },

  // ----------------------------------
  // Stardog platform Configuration
  // ----------------------------------
  stardog: {
    endpoint: process.env.STARDOG_ENDPOINT || 'http://localhost:5820/',
    credentials: ['admin', 'admin'], // as super user
    dbName: process.env.STARDOG_DB || 'wm-test',
  },
};
