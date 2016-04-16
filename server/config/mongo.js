import mongoose from 'mongoose';
import _debug from 'debug';
import config from './app.config';

const debug = _debug('app:mongodb');

export default () => {
  const connect = () => {
    mongoose.connect(config.mongodb_url, (err) => {
      if (err) {
        debug(`Error connecting to ${config.mongodb_url}`);
        debug(`Reason: ${err}`);
      } else {
        debug(`Succeeded in connecting to ${config.mongodb_url}`);
      }
    });
  };

  connect();

  const { connection } = mongoose;

  connection.on('error', debug);
  connection.on('disconnected', connect);
};
