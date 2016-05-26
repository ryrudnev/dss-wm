import _debug from 'debug';
import mongoose from 'mongoose';
import config from './config';

const debug = _debug('api:mongodb');

export default () => {
  // For supporting full promises
  mongoose.Promise = Promise;

  const onConnect = (err) => {
    if (err) {
      debug(`Error connecting to ${config.mongodb.url}`);
      debug(`${err}`);
    } else {
      debug(`Successfully connecting to ${config.mongodb.url}`);
    }
  };

  const connect = () => {
    mongoose.connect(config.mongodb.url, { promiseLibrary: Promise }, onConnect);
  };

  connect();

  const { connection } = mongoose;

  connection.on('error', debug);
  connection.on('disconnected', connect);

  return 0;
};
