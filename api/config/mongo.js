import _debug from 'debug';
import apiConfig from './api.config';

const debug = _debug('api:mongodb');

export default (mongoose) => {
  // For supporting full promises
  mongoose.Promise = Promise;

  const onConnect = (err) => {
    if (err) {
      debug(`Error connecting to ${apiConfig.mongodb.url}`);
      debug(`${err}`);
    } else {
      debug(`Successfully connecting to ${apiConfig.mongodb.url}`);
    }
  };

  const connect = () => {
    mongoose.connect(apiConfig.mongodb.url, { promiseLibrary: Promise }, onConnect);
  };

  connect();

  const { connection } = mongoose;

  connection.on('error', debug);
  connection.on('disconnected', connect);
};
