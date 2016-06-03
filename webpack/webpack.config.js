var webpack = require('webpack');
var webpackMerge = require('webpack-merge');
var prodConfig = require('./prod.config');
var devConfig = require('./dev.config');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var path = require('path');

var isProd = process.env.NODE_ENV === 'production';

var host = (process.env.HOST || 'localhost');
var port = (process.env.PORT || 3000);

var commonConfig = {
  context: path.resolve(__dirname, '..'),

  output: {
    // Physical files are only output by the production
    path: path.resolve(__dirname, '../dist'),
    // Only necessary in Dev
    publicPath: isProd ? '/dist/' : ('http://' + host + ':' + port + '/dist/'),
    // output entry file
    filename: 'bundle.js',
  },

  resolve: {
    root: path.resolve(__dirname, '../app'),
    extensions: ['', '.jsx', '.js', '.json', '.less'],
    modulesDirectories: [
      'node_modules'
    ],
  },

  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        include: path.join(__dirname, '../app'),
        loaders: ['babel'],
      },
      { test: /\.(png|woff|woff2|eot|ttf|svg)$/, loader: 'url-loader?limit=100000' },
      { test: /\.(jpe|jpg|woff|woff2|eot|ttf|svg)(\?.*$|$)/, loaders: ['file-loader'] },
    ],
  },

  plugins: [
    new CleanWebpackPlugin(['dist'], { root: path.resolve(__dirname, '..') }),

    new CopyWebpackPlugin([{ from: './app/static' }]),

    new HtmlWebpackPlugin({
      title: 'DSS WM',
      favicon: 'app/static/favicon.ico',
      template: 'app/index.ejs',
      inject: true,
      hash: isProd,
    }),

    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(isProd ? 'production' : 'development'),
      },
      __DEVELOPMENT__: !isProd,
    }),
  ],

};

if (isProd) {
  module.exports = webpackMerge(prodConfig, commonConfig);
} else {
  module.exports = webpackMerge(devConfig, commonConfig);
}
