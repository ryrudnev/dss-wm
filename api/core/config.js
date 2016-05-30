import path from 'path';
import fs from 'fs';

// set specific parameters if it's testing
const isTesting = process.env.NODE_ENV === 'test';

const stardogDb = isTesting ? 'wm-test' : (process.env.STARDOG_DB || 'wm');
const mongodb = isTesting ? 'mongodb://localhost/wm-test' : (process.env.MONGO_URL || 'mongodb://localhost/wm');
const serverPort = isTesting ? 1337 : (process.env.API_PORT || 3001);

const config = {
  // Log path
  logDir: path.resolve(__dirname, '../../logs'),

  // ----------------------------------
  // Localizations Configuration
  // ----------------------------------
  translations: {
    // setup some locales - other locales default to en silently
    locales: ['en', 'ru'],

    // default locale
    defaultLocale: 'en',

    updateFiles: false,

    extension: '.json',

    // query parameter to switch locale (ie. /home?lang=ch) - defaults to NULL
    queryParameter: 'lang',

    // where to store json files - defaults to '../locales' relative to modules directory
    directory: path.resolve(__dirname, '../locales'),
  },

  // ----------------------------------
  // Server Configuration
  // ----------------------------------
  server: {
    port: serverPort,
  },

  // ----------------------------------
  // MongoDB Configuration
  // ----------------------------------
  mongodb: {
    url: mongodb,
  },

  // ----------------------------------
  // Security Configuration
  // ----------------------------------
  jwt: {
    secret: 'DSS-WM-secret',
    tokenExpirationTime: 24 * 60 * 60,
    audience: `http://localhost:${serverPort}`,
    issuer: 'admin@dsswm.me',
  },

  // ----------------------------------
  // Stardog platform Configuration
  // ----------------------------------
  stardog: {
    endpoint: process.env.STARDOG_ENDPOINT || 'http://localhost:5820/',
    credentials: ['admin', 'admin'], // as super user

    database: stardogDb,

    // Default options for creating a new db
    newDbOptions: {

      database: stardogDb,

      options: {
        'database.namespaces': [
          'rdf=http://www.w3.org/1999/02/22-rdf-syntax-ns#',
          'rdfs=http://www.w3.org/2000/01/rdf-schema#',
          'xsd=http://www.w3.org/2001/XMLSchema#',
          'owl=http://www.w3.org/2002/07/owl#',
          'stardog=tag:stardog:api:',
        ],
        'database.online': true,
        'database.connection.timeout': '1h',
        'index.differential.enable.limit': 1000000,
        'index.differential.merge.limit': 10000,
        'index.literals.canonical': true,
        'index.named.graphs': true,
        'index.persist': true,
        'index.persist.sync': false,
        'index.statistics.update.automatic': true,
        'index.type': 'Disk',
        'spatial.enabled': false,
        'icv.active.graphs': 'tag:stardog:api:context:default',
        'icv.consistency.automatic': false,
        'icv.enabled': false,
        'icv.reasoning.enabled': false,
        'reasoning.type': 'SL',
        'reasoning.approximate': false,
        'reasoning.sameas': 'OFF',
        'reasoning.schema.graphs': 'tag:stardog:api:context:all',
        'reasoning.virtual.graph.enabled': true,
        'reasoning.punning.enabled': false,
        'reasoning.consistency.automatic': false,
        'reasoning.schema.timeout': '60s',
        'search.enabled': false,
        'search.reindex.mode': 'sync',
        'transaction.logging': false,
        'transaction.isolation': 'SNAPSHOT',
        'database.archetypes': [],
        'database.name': stardogDb,
      },

      files: [{
        filename: path.resolve(__dirname, '../owl/example-ontology.ttl'), context: ':',
      }],

    },
  },
};

if (!fs.existsSync(config.logDir)) {
  fs.mkdirSync(config.logDir);
}

export default config;
