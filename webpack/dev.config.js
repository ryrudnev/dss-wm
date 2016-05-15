var webpack = require('webpack');

module.exports = {
  debug: true,

  devtool: 'inline-source-map',

  entry: [
    'webpack-hot-middleware/client?&reload=true',
    'react-hot-loader/patch',
    './app/index',
  ],

  resolve: {
    unsafeCache: true,
  },

  module: {
    loaders: [
      {
        test: /(\.css|\.scss)$/,
        loader: 'style!css?sourceMap!sass?sourceMap',
      },
    ],
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
  ],
};
