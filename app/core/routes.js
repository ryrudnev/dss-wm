import { LogoutRoute, LoginRoute } from '../routes';

export default {
  logout: new LogoutRoute(),
  login: new LoginRoute(),
};
