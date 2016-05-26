import _debug from 'debug';
import http from 'http';
import initApp from './config/express';
import initSeeds from './seeds';
import stardog from './services/stardog';
import mongoConnect from './config/mongo';

const debug = _debug('api:server');

function runServer(app) {
  const server = new http.Server(app);
  // Run server
  server.listen(app.get('port'), error => {
    if (error) {
      return Promise.reject(error);
    }
    debug(`Api server is running on http://localhost:${app.get('port')}`);
    return Promise.resolve();
  });
}

Promise.resolve(mongoConnect())
  .then(() => Promise.resolve(
    initSeeds()
  ))
  .then(() => Promise.resolve(
    stardog.init()
  ))
  .then(() => Promise.resolve(
    initApp()
  ))
  .then((app) => Promise.resolve(
    runServer(app)
  ))
  .catch(err => debug(`Error ${err}`));
