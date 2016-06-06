import {
  LogoutRoute,
  LoginRoute,
  CompanyIndexRoute,
  CompanyCreateRoute,
  CompanyShowRoute,
  CompanyEditRoute,
  WasteTypeIndexRoute,
  WasteTypeShowRoute,
  WasteTypeCreateRoute,
  WasteTypeEditRoute,
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
  'waste-types': new WasteTypeIndexRoute,
  'waste-types/new': {
    uses: new WasteTypeCreateRoute, parent: 'companies',
  },
  'waste-types/:fid': {
    uses: new WasteTypeShowRoute, parent: 'waste-types', as: 'waste-types/show',
  },
  'waste-types/:fid/edit': {
    uses: new WasteTypeEditRoute, parent: 'waste-types/show', as: 'waste-types/edit',
  },
  logout: new LogoutRoute,
  login: new LoginRoute,
  '*notfound': new NotFoundRoute,
};
