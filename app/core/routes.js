import {
  LogoutRoute,
  LoginRoute,
  CompanyIndexRoute,
  CompanyCreateRoute,
  CompanyShowRoute,
  CompanyEditRoute,
  NotFoundRoute,
} from '../routes';

const companyIndexRoute = new CompanyIndexRoute;

export default {
  '': { uses: companyIndexRoute, as: 'home' },
  companies: companyIndexRoute,
  'companies/new': {
    uses: new CompanyCreateRoute, parent: 'companies',
  },
  'companies/:fid': {
    uses: new CompanyShowRoute, parent: 'companies', as: 'companies/show',
  },
  'companies/:fid/edit': {
    uses: new CompanyEditRoute, parent: 'companies/show', as: 'companies/edit',
  },
  logout: new LogoutRoute,
  login: new LoginRoute,
  '*notfound': new NotFoundRoute,
};
