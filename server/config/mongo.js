import mongoose from 'mongoose';
import _debug from 'debug';
import appConfig from './app.config';

const debug = _debug('app:mongodb');

// For supporting full promises
// mongoose.Promise = Promise;

export default () => {
  const connect = () => {
    mongoose.connect(appConfig.mongodb.url, (err) => {
      if (err) {
        debug(`Error connecting to ${appConfig.mongodb.url}`);
        debug(`${err}`);
      } else {
        debug(`Succeeded in connecting to ${appConfig.mongodb.url}`);
      }
    });
  };

  connect();

  const { connection } = mongoose;

  connection.on('error', debug);
  connection.on('disconnected', connect);
};
