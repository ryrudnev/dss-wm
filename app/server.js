import _debug from 'debug';
import Express from 'express';
import webpack from 'webpack';
import webpackConfig from '../webpack/webpack.config';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import config from './config';
import morgan from 'morgan';
import proxy from 'http-proxy-middleware';
import path from 'path';

const serverLog = _debug('server');
const webpackLog = _debug('server:webpack');
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
    noInfo: true,

    // Dev middleware can't access config, so we provide publicPath
    publicPath: webpackConfig.output.publicPath,

    // watch options
    // The solution for webpack reload in Vagrant shared folders and Windows
    // https://github.com/webpack/webpack-dev-server/issues/155
    watchOptions: {
      aggregateTimeout: 300,
      poll: true,
    },

  }));

  app.use(webpackHotMiddleware(compiler, {
    path: '/__webpack_hmr',

    log: webpackLog,

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

if (!config.isProd) {
  app.get('*', (req, res, next) => {
    const filename = path.join(compiler.outputPath, 'index.html');
    compiler.outputFileSystem.readFile(filename, (err, result) => {
      if (err) {
        return next(err);
      }
      res.set('content-type', 'text/html');
      res.send(result);
      res.end();
    });
  });
}

// Can not run a server by host in Vagrant shared folder
app.listen(config.port, /* config.host */ error => {
  if (error) {
    errorLog(`Error ${error}`);
  } else {
    serverLog(`Server is listening on http://${config.host}:${config.port}`);
  }
});
