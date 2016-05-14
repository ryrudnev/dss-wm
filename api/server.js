import Express from 'express';
import _debug from 'debug';
import http from 'http';
import fs from 'fs';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import methodOverride from 'method-override';
import helmet from 'helmet';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import mongoInit from './config/mongo';
import passportInit from './config/passport';
import roles from './config/roles';
import translations from './config/translations';
import { qsParser } from './util/expressUtils';
import routes from './routes';
import appConfig from './config/app.config';

const debug = _debug('api:server');

// Connect to MongoDB using mongoose
mongoInit(mongoose);

// Initialize seeds if needed
import initSeeds from './seeds';
initSeeds();

// Initialize the express application
const app = new Express();
const server = new http.Server(app);
const stream = fs.createWriteStream(appConfig.logPath, { flags: 'a' });

app.set('trust proxy', 1);

app.use(morgan('combined', { stream }));

// Method override for support old browsers
app.use(methodOverride());

// Allowing requests to come from different domains in order to develop a client-independent system
app.use(cors());

// Protect Api server
app.use(helmet());

// Set request parsers
app.use(cookieParser());
app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ limit: '20mb', extended: false }));
app.use(qsParser());

// Set localizations
app.use(translations());

// Bootstrap passport plugin settings
app.use(passportInit(passport).initialize());

// Set users roles
app.use(roles.middleware());

// API endpoints with authentication via passport
app.use(routes(passport, roles));

// Run server
server.listen(appConfig.server.port, error => {
  const host = server.address().address;
  const port = server.address().port;

  if (!error) {
    debug(`Api server is running on http://${host}:${port}`);
  }
});
