var webpack = require('webpack');
var webpackMerge = require('webpack-merge');
var prodConfig = require('./prod.config');
var devConfig = require('./dev.config');
var path = require('path');

var host = (process.env.HOST || 'localhost');
var port = (process.env.PORT || 3000);

// const rootPath = path.resolve(__dirname, '../app');
var outputPath = path.resolve(__dirname, '../dist');
var publicPath = process.env.NODE_ENV === 'production' ? '/dist/' : ('http://' + host + port + '/dist/');

var commonConfig = {
  output: {
    // Note: Physical files are only output by the production
    path: outputPath,
    // Note: Only necessary in Dev
    publicPath: publicPath,
    // entry
    filename: 'bundle.js',
  },

  resolve: {
    // root: rootPath,
    extensions: ['', '.jsx', '.js'],
    modulesDirectories: ['node_modules'],
  },

  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel',
      },
      {
        test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url?limit=10000&mimetype=application/font-woff',
      },
      {
        test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url?limit=10000&mimetype=application/font-woff2',
      },
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url?limit=10000&mimetype=application/octet-stream',
      },
      {
        test: /\.otf(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url?limit=10000&mimetype=application/font-otf',
      },
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file',
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url?limit=10000&mimetype=image/svg+xml',
      },
      {
        test: /\.png$/,
        loader: 'file?name=[name].[ext]',
      },
      {
        test: /\.jpg$/,
        loader: 'file?name=[name].[ext]',
      },
      {
        test: /\.gif$/,
        loader: 'file?name=[name].[ext]',
      },
    ],
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(
            process.env.NODE_ENV === 'development' ? 'development' : 'production'
        ),
      },
      __DEV__: process.env.NODE_ENV === 'development',
      __PROD__: process.env.NODE_ENV === 'production',
    }),
  ],

};

if (process.env.NODE_ENV === 'production') {
  module.exports = webpackMerge.smart(prodConfig, commonConfig);
}

if (process.env.NODE_ENV === 'development') {
  module.exports = webpackMerge.smart(devConfig, commonConfig);
}
