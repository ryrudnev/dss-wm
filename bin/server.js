var fs = require('fs');

var config = JSON.parse(fs.readFileSync('./.babelrc'));
require('babel-core/register')(config);
require('babel-polyfill');
require('../app/server/server.js');
