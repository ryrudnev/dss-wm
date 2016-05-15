var webpack = require('webpack');

webpack.debug = true;

var host = (process.env.HOST || 'localhost');
var port = (process.env.PORT || 3000);

module.exports = {
  debug: true,

  progress: true,

  devtool: 'inline-source-map',

  entry: [
    'webpack-hot-middleware/client?reload=true&path=' + 'http://' + host + ':' + port + '/__webpack_hmr',
    'react-hot-loader/patch',
    './app/index',
  ],

  module: {
    loaders: [
      {
        test: /(\.css|\.scss)$/,
        loaders: ['style', 'css?sourceMap', 'sass?sourceMap']
      },
    ],
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
  ],
};
