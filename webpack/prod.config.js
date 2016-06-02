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
        test: /\.less$/,
        include: path.join(__dirname, '../app'),
        loader: ExtractTextPlugin.extract('style', 'css?minimize!less'),
      },
    ],
  },

  plugins: [
    new ExtractTextPlugin('style.css', { allChunks: true }),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress: { warnings: false },
    }),
  ],
};
