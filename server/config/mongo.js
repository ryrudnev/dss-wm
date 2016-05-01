import _debug from 'debug';
import appConfig from './app.config';

const debug = _debug('app:mongodb');

export default (mongoose) => {
  // For supporting full promises
  mongoose.Promise = Promise; // eslint-disable-line no-param-reassign

  const onConnect = (err) => {
    if (err) {
      debug(`Error connecting to ${appConfig.mongodb.url}`);
      debug(`${err}`);
    } else {
      debug(`Succeeded in connecting to ${appConfig.mongodb.url}`);
    }
  };

  const connect = () => {
    mongoose.connect(appConfig.mongodb.url, { promiseLibrary: Promise }, onConnect);
  };

  connect();

  const { connection } = mongoose;

  connection.on('error', debug);
  connection.on('disconnected', connect);
};
