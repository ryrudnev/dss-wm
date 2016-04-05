import Express from 'express';
import bodyParser from 'body-parser';
import config from './config';
import logger from 'morgan';
import api from './routes';

// Initialize the express application
const app = new Express();

// Only for development mode
if (process.env.NODE_ENV !== 'production') {
  app.use(logger('dev'));
}

app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ limit: '20mb', extended: false }));

// API endpoints
app.use('/api', api);

const server = app.listen(config.server.port, error => {
  const address = server.address();

  if (!error) {
    console.log(`Server is running on port ${address.port}`); // eslint-disable-line
  }
});

export default app;
