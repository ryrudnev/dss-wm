import Express from 'express';
import bodyParser from 'body-parser';
import _debug from 'debug';
import passport from 'passport';
import methodOverride from 'method-override';
import mongoose from 'mongoose';
import cors from 'cors';
import mongoInit from './config/mongo';
import passportInit from './config/passport';
import roles from './config/roles';
import { qsParser } from './util/expressUtils';
import api from './routes/api';
import appConfig from './config/app.config';

const debug = _debug('app:server');

// Connect to MongoDB using mongoose
mongoInit(mongoose);

// Initialize seeds if needed
import initSeeds from './seeds';
initSeeds();

// Initialize the express application
const app = new Express();

// Only for development mode
if (appConfig.env === 'development') {
  //
}

// Method override for support old browsers
app.use(methodOverride());
// Allowing requests to come from different domains in order to develop a client-independent system
app.use(cors());
// Set request parsers
app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ limit: '20mb', extended: false }));
app.use(qsParser());

// Bootstrap passport plugin settings
app.use(passportInit(passport).initialize());

// Set users roles
app.use(roles.middleware());

// API endpoints with authentication via passport
app.use(api(passport, roles));

// Run server
const server = app.listen(appConfig.server.port, error => {
  const address = server.address();

  if (!error) {
    debug(`Server is running on port ${address.port}`);
  }
});

export default app;
