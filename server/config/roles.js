import ConnectRoles from 'connect-roles';
import _debug from 'debug';
import { respondForbidden } from '../util/expressUtils';
import { } from '../util/utils';

const debug = _debug('app:roles');

const roles = new ConnectRoles({
  failureHandler(req, res, action) {
    const { user = {} } = req;
    debug(`Access denied for: user (${user.username}), action (${action})`);
    respondForbidden.call(res, `Access Denied - You don't have permission to: ${action}`);
  },

  async: true,

  userProperty: 'user',

  matchRelativePaths: false,
});

roles.use((req, action) => {
  if (!req.isAuthenticated()) {
    return action === 'get token';
  }
});

roles.use('', req => {

});

roles.use(req => {
  if (req.user.role === 'admin') {
    return true;
  }
});

export default roles;
