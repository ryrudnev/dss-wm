var webpack = require('webpack');

webpack.debug = true;

module.exports = {
  debug: true,

  progress: true,

  devtool: 'inline-source-map',

  entry: [
    'webpack-hot-middleware/client?reload=true',
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
