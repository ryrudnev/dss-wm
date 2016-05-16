var webpack = require('webpack');

var host = (process.env.HOST || 'localhost');
var port = (process.env.PORT || 3000);

webpack.debug = true;

module.exports = {
  debug: true,

  progress: true,

  devtool: 'inline-source-map',

  entry: [
    'webpack-hot-middleware/client?reload=true&path=' + 'http://' + host + ':' + port + '/__webpack_hmr',
    'react-hot-loader/patch',
    './app/main',
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
