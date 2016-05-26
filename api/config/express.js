import _debug from 'debug';
import Express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import methodOverride from 'method-override';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import passportConfig from './passport';
import roles from './roles';
import translations from './translations';
import { qsParser } from '../util/expressUtils';
import routes from '../routes';
import config from './config';

const debug = _debug('api:express');

// Initialize the express application
export default (app = new Express()) => {
  app.set('port', config.server.port);

  app.use(morgan('combined'));

  // Method override for support old browsers
  app.use(methodOverride());

  // Allowing requests to come from different domains in order to develop a client system
  app.use(cors());

  // Protect Api server
  app.use(helmet());

  // Set request parsers
  app.use(cookieParser());
  app.use(bodyParser.json({ limit: '20mb' }));
  app.use(bodyParser.urlencoded({ limit: '20mb', extended: false }));
  app.use(qsParser());

  // Init localizations
  app.use(translations());

  // Bootstrap passport plugin settings
  app.use(passportConfig(passport).initialize());

  // Init users roles
  app.use(roles.middleware());

  // API endpoints with authentication via passport
  app.use(routes(passport, roles));

  debug('Express app successfully initialized');
  return app;
};
