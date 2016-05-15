var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  debug: false,

  devtool: 'source-map',

  entry: './app/index',

  module: {
    loaders: [
      {
        test: /(\.css|\.scss)$/,
        loader: ExtractTextPlugin.extract('style', 'css?minimize!sass'),
      },
    ],
  },

  plugins: [
    new ExtractTextPlugin('bundle.css'),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress: { warnings: false },
    }),
  ],
};
