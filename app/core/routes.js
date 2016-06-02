import {
  LogoutRoute,
  LoginRoute,
  CompanyIndexRoute,
  NotFoundRoute,
} from '../routes';

const companyIndexRoute = new CompanyIndexRoute;

export default {
  '': { uses: companyIndexRoute, as: 'home' },
  companies: companyIndexRoute,
  logout: new LogoutRoute,
  login: new LoginRoute,
  '*notfound': new NotFoundRoute,
};
