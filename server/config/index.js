import fs from 'fs';
import _debug from 'debug';
import config from './base';

const debug = _debug('app:config');
debug('Create configuration.');
debug(`Apply environment overrides for NODE_ENV "${config.env}".`);

const overridesFilename = `${config.env}`;
let hasOverridesFile;
try {
  fs.lstatSync(`${__dirname}/${overridesFilename}.js`);
  hasOverridesFile = true;
} catch (e) {
  debug(`File ${__dirname}/${overridesFilename}.js not exists.`);
}

let overrides;
if (hasOverridesFile) {
  overrides = require(`./${overridesFilename}`).default(config);
} else {
  debug(`No configuration overrides found for NODE_ENV "${config.env}".`);
}

export default Object.assign({}, config, overrides);
