import Express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import _debug from 'debug';
import appConfig from './config/app.config';
import mongoConnect from './config/mongo';
import passportInit from './config/passport';
import passport from 'passport';
import api from './routes/api';
import users from './routes/users.routes';

const debug = _debug('app:server');

// Connect to MongoDB using mongoose
mongoConnect();

// Initialize the express application
const app = new Express();

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

// API endpoints with authenticate via passport
app.use('/api', (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (user) {
      return next();
    }
    return res.status(403).json({
      code: 403,
      success: false,
      message: 'Token could not be authenticated',
    });
  })(req, res, next);
});
app.use('/api', api);

app.use('/users', users);

// Run server
const server = app.listen(appConfig.server_port, error => {
  const address = server.address();

  if (!error) {
    debug(`Server is running on port ${address.port}`);
  }
});

export default app;
