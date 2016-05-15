import _debug from 'debug';
import Express from 'express';
import http from 'http';
import webpack from 'webpack';
import webpackConfig from '../../webpack/webpack.config';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import appConfig from '../config';
import { renderFullPage } from './util/renderer';
import morgan from 'morgan';
import proxy from 'http-proxy';
import path from 'path';

const serverLog = _debug('server');
const errorLog = _debug('server:error');
const webpackLog = _debug('server:webpack');

const compiler = webpack(webpackConfig);
const app = new Express();
const server = new http.Server(app);
const proxyServer = proxy.createProxyServer({});

app.use(morgan('short'));

if (process.env.NODE_ENV === 'development') {
  app.use(webpackDevMiddleware(compiler, {
    noInfo: true, publicPath: webpackConfig.output.publicPath,
  }));

  app.use(webpackHotMiddleware(compiler, {
    log: webpackLog, path: '/__webpack_hmr', heartbeat: 10 * 1000,
  }));
}

proxyServer.on('error', (err, req) => {
  errorLog(`Error ${err}
         Url ${req.url}`);
});

// Activate proxy for session
app.use(/\/api\/(.*)/, (req, res) => {
  req.url = req.originalUrl;
  proxyServer.web(req, res, { target: `http://${appConfig.apiHost}:${appConfig.apiPort}` });
});

// Static directory for express
app.use('/dist', Express.static(path.resolve(__dirname, '/../../dist/')));

app.get(/.*/, (req, res) => {
  const host = req.get('host').replace(/\:.*/, ''); // eslint-disable-line no-useless-escape
  res.end(renderFullPage('', host, appConfig.port));
});

server.listen(appConfig.port, error => {
  const port = server.address().port;

  if (error) {
    errorLog(`Error ${error}`);
  } else {
    serverLog(`Server is listening on http://localhost:${port}`);
  }
});
