import _debug from 'debug';
import stardog from './core/stardog';
import mongoose from 'mongoose';
import config from './core/config';
import dummyData from './dummy.data';

const debug = _debug('api');

// check owl connection via stardog
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

  debug('Mongodb successfully connected!');
});

// init and listen app
import './core/app';

