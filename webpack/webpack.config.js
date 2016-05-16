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
    extensions: ['', '.jsx', '.js', '.json', '.scss'],
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
      {
        test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader?limit=10000&mimetype=application/font-woff',
      },
      {
        test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader?limit=10000&mimetype=application/font-woff2',
      },
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader?limit=10000&mimetype=application/octet-stream',
      },
      {
        test: /\.otf(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader?limit=10000&mimetype=application/font-otf',
      },
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader',
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader?limit=10000&mimetype=image/svg+xml',
      },
      {
        test: /\.png$/,
        loader: 'file-loader?name=[name].[ext]',
      },
      {
        test: /\.jpg$/,
        loader: 'file-loader?name=[name].[ext]',
      },
      {
        test: /\.gif$/,
        loader: 'file-loader?name=[name].[ext]',
      },
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
      __DEV__: !isProd,
      __PROD__: isProd,
    }),
  ],

};

if (isProd) {
  module.exports = webpackMerge(prodConfig, commonConfig);
} else {
  module.exports = webpackMerge(devConfig, commonConfig);
}
