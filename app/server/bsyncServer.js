// Require Browsersync along with webpack and middleware for it
import browserSync from 'browser-sync';
// see https://github.com/BrowserSync/browser-sync/issues/204#issuecomment-102623643
import historyApiFallback from 'connect-history-api-fallback';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import webpackConfig from '../../webpack/webpack.config';
import proxy from 'http-proxy-middleware';
import config from '../config';
import { buildHtml } from './util/renderer';

const bundler = webpack(webpackConfig);

const middleware = [
  proxy('/api', {
    target: `http://${config.apiHost}:${config.apiPort}/api`,
    changeOrigin: true,
  }),
];

if (!config.isProd) {
  middleware.push(
      webpackDevMiddleware(bundler, {
        // Dev middleware can't access config, so we provide publicPath
        publicPath: webpackConfig.output.publicPath,

        // pretty colored output
        stats: { colors: true },

        // Set to false to display a list of each file that is being bundled.
        noInfo: true,

        hot: true,
        // for other settings see
        // http://webpack.github.io/docs/webpack-dev-middleware.html
      }),

      webpackHotMiddleware(bundler, {
        path: '/__webpack_hmr',

        heartbeat: 10 * 1000,
      })
  );
}
middleware.push(historyApiFallback());

buildHtml().then(() => {
  browserSync({
    port: config.port,
    ui: { port: Number(config.port + 1) },
    server: {
      baseDir: 'dist',
      middleware,
    },
  });
});
