import _debug from 'debug';
import Express from 'express';
import configureApp from './core/express';
import stardog from './core/stardog';
import mongoose from 'mongoose';
import config from './core/config';
import dummyData from './dummyData';

const debug = _debug('api:server');

// Check owl connection via stardog
stardog.checkDb().catch(error => {
  debug('Please make sure Stardog is installed and running!');
  throw error;
});

mongoose.Promise = Promise;
mongoose.connect(config.mongodb.url, { promiseLibrary: Promise }, error => {
  if (error) {
    debug('Please make sure Mongodb is installed and running!');
    throw error;
  }
  // feed some dummy data in DB.
  dummyData();
});

const app = new Express();
configureApp(app);

app.listen(config.server.port, (error) => {
  if (!error) {
    debug(`Api server is running on ${config.server.port} port`);
  } else {
    debug('Server error');
    throw error;
  }
});

export default app;
