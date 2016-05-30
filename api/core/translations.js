import i18n from 'i18n';
import config from './config';

i18n.configure({ ...config.translations });

export default () => {
  return (req, res, next) => {
    i18n.init(req, res);

    i18n.setLocale(req.getLocale());

    return next();
  };
};

export function __(...rest) {
  return i18n.__.apply(i18n, rest);
}
