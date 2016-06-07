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
  MethodTypeIndexRoute,
  MethodTypeShowRoute,
  MethodTypeCreateRoute,
  MethodTypeEditRoute,
  WasteShowRoute,
  WasteCreateRoute,
  WasteEditRoute,
  MethodShowRoute,
  MethodCreateRoute,
  MethodEditRoute,
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
  'companies/:fid/waste/new': {
    uses: new WasteCreateRoute, parent: 'companies/show', as: 'companies/waste/new',
  },
  'companies/:fid/waste/:wfid': {
    uses: new WasteShowRoute, parent: 'companies/show', as: 'companies/waste',
  },
  'companies/:fid/waste/:wfid/edit': {
    uses: new WasteEditRoute, parent: 'companies/waste', as: 'companies/waste/edit',
  },
  'waste-types': new WasteTypeIndexRoute,
  'waste-types/new': {
    uses: new WasteTypeCreateRoute, parent: 'waste-types',
  },
  'waste-types/:fid': {
    uses: new WasteTypeShowRoute, parent: 'waste-types', as: 'waste-types/show',
  },
  'waste-types/:fid/edit': {
    uses: new WasteTypeEditRoute, parent: 'waste-types/show', as: 'waste-types/edit',
  },
  'method-types': new MethodTypeIndexRoute,
  'method-types/new': {
    uses: new MethodTypeCreateRoute, parent: 'method-types',
  },
  'method-types/:fid': {
    uses: new MethodTypeShowRoute, parent: 'method-types', as: 'method-types/show',
  },
  'method-types/:fid/edit': {
    uses: new MethodTypeEditRoute, parent: 'method-types/show', as: 'method-types/edit',
  },
  'companies/:fid/methods/new': {
    uses: new MethodCreateRoute, parent: 'companies/show', as: 'companies/methods/new',
  },
  'companies/:fid/methods/:mfid': {
    uses: new MethodShowRoute, parent: 'companies/show', as: 'companies/methods',
  },
  'companies/:fid/methods/:mfid/edit': {
    uses: new MethodEditRoute, parent: 'companies/methods', as: 'companies/methods/edit',
  },
  logout: new LogoutRoute,
  login: new LoginRoute,
  '*notfound': new NotFoundRoute,
};
