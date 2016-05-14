import i18n from 'i18n';
import appConfig from './app.config';

i18n.configure({ ...appConfig.translations });

export default () => (req, res, next) => {
  i18n.init(req, res);

  i18n.setLocale(req.getLocale());

  return next();
};

export function __(...rest) {
  return i18n.__.apply(i18n, rest);
}
