import Express from 'express';
import bodyParser from 'body-parser';
import _debug from 'debug';
import config from './config';
import api from './routes';

const debug = _debug('app:server');

// Initialize the express application
const app = new Express();

// Only for development mode
if (config.env === 'development') {
  //
}

app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ limit: '20mb', extended: false }));

// API endpoints
app.use('/api', api);

const server = app.listen(config.server_port, error => {
  const address = server.address();

  if (!error) {
    debug(`Server is running on port ${address.port}`);
  }
});

export default app;
