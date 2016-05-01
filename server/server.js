import Express from 'express';
import bodyParser from 'body-parser';
import _debug from 'debug';
import passport from 'passport';
import methodOverride from 'method-override';
import mongoose from 'mongoose';
import cors from 'cors';
import mongoInit from './config/mongo';
import passportInit from './config/passport';
import appConfig from './config/app.config';
import api from './routes/api';
import auth from './routes/auth.routes';
import { qsParser } from './util/expressUtils';

const debug = _debug('app:server');

// Connect to MongoDB using mongoose
mongoInit(mongoose);

// Initialize the express application
const app = new Express();

app.use(methodOverride());

// Only for development mode
if (appConfig.env === 'development') {
  //
}

// Bootstrap passport plugin settings
passportInit(passport);
app.use(passport.initialize());

// Allowing requests to come from different domains in order to develop a client-independent system
app.use(cors());

app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ limit: '20mb', extended: false }));
app.use(qsParser());

// API endpoints with authentication via passport
app.use('/api', (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (user) {
      return next();
    }
    return res.status(403).json({
      code: 403,
      success: false,
      message: 'Token could not be authenticated',
      data: null,
    });
  })(req, res, next);
});
app.use('/api', api);

// Routes for an authentication
app.use('/auth', auth);

// Run server
const server = app.listen(appConfig.server.port, error => {
  const address = server.address();

  if (!error) {
    debug(`Server is running on port ${address.port}`);
  }
});

export default app;
