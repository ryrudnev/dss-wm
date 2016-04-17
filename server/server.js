import Express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import _debug from 'debug';
import passport from 'passport';
import methodOverride from 'method-override';
import mongoConnect from './config/mongo';
import passportInit from './config/passport';
import appConfig from './config/app.config';
import api from './routes/api';
import auth from './routes/auth.routes';

const debug = _debug('app:server');

// Connect to MongoDB using mongoose
mongoConnect();

// Initialize the express application
const app = new Express();

app.use(methodOverride());

// Bootstrap passport plugin settings
passportInit(passport);
app.use(passport.initialize());

// Only for development mode
if (appConfig.env === 'development') {
  //
}

app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ limit: '20mb', extended: false }));
app.use(cookieParser());

// Allowing requests to come from different domains in order to develop a client-independent system
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
  next();
});

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
