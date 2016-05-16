import _debug from 'debug';
import Express from 'express';
import webpack from 'webpack';
import webpackConfig from '../../webpack/webpack.config';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import config from '../config';
import { renderFullPage } from './util/renderer';
import morgan from 'morgan';
import proxy from 'http-proxy-middleware';

const serverLog = _debug('server');
const errorLog = _debug('server:error');

const compiler = webpack(webpackConfig);
const app = new Express();

app.use(morgan('short'));

if (!config.isProd) {
  app.use(webpackDevMiddleware(compiler, {
    // pretty colored output
    stats: { colors: true },

    hot: true,

    // Set to false to display a list of each file that is being bundled.
    // noInfo: true,

    // Dev middleware can't access config, so we provide publicPath
    publicPath: webpackConfig.output.publicPath,
  }));

  app.use(webpackHotMiddleware(compiler, {
    path: '/__webpack_hmr',

    heartbeat: 10 * 1000,
  }));
}

// Activate proxy for session
app.use('/api', proxy({
  target: `http://${config.apiHost}:${config.apiPort}/api`,
  changeOrigin: true,
}));

// Static directory for express
app.use('/dist', Express.static(`${__dirname}/../../dist/`));

app.get(/.*/, (req, res) => {
  const host = req.get('host').replace(/\:.*/, ''); // eslint-disable-line no-useless-escape
  res.end(renderFullPage(host, config.port));
});

app.listen(config.port, error => {
  if (error) {
    errorLog(`Error ${error}`);
  } else {
    serverLog(`Server is listening on http://localhost:${config.port}`);
  }
});
