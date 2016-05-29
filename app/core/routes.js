import { LogoutRoute, LoginRoute, NotfoundRoute } from '../routes';

export default {
  logout: new LogoutRoute(),
  login: new LoginRoute(),
  '*notfound': new NotfoundRoute(),
};
