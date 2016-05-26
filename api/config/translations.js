import i18n from 'i18n';
import _debug from 'debug';
import config from './config';

const debug = _debug('api:translations');

i18n.configure({ ...config.translations });

export default () => {
  debug('Localizations successfully initialized');

  return (req, res, next) => {
    i18n.init(req, res);

    i18n.setLocale(req.getLocale());

    return next();
  };
};

export function __(...rest) {
  return i18n.__.apply(i18n, rest);
}
