var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var path = require('path');

module.exports = {
  debug: false,

  devtool: 'source-map',

  entry: './app/main',

  module: {
    loaders: [
      {
        test: /(\.css|\.scss)$/,
        include: path.join(__dirname, '../app'),
        loader: ExtractTextPlugin.extract('css?minimize!sass'),
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
