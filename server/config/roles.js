import ConnectRoles from 'connect-roles';
import _debug from 'debug';
import objectPath from 'object-path';
import { respondForbidden } from '../util/expressUtils';
import { intersectArray } from '../util/utils';

// Get only allowed subjects for the user.
function onlyAllowedSubjects(req, subjectsPath) {
  const subjects = objectPath.get(req, subjectsPath, false);
  if (!subjects) {
    return false;
  }

  const allowed = intersectArray(req.user.subjects, subjects);
  if (!allowed.length) {
    return false;
  }

  if (~subjectsPath.indexOf('forSubjects')) {
    objectPath.set(req, subjectsPath, allowed);
  } else if (~subjectsPath.indexOf('forSubject')) {
    objectPath.set(req, subjectsPath, allowed[0]);
  }

  return true;
}

const debug = _debug('app:roles');

const roles = new ConnectRoles({
  failureHandler(req, res, action) {
    const { user = {}, roleError = '' } = req;
    debug(`Access denied for user (${user.username}) to do action (${action}). ${roleError}`);
    respondForbidden.call(res, `Access Denied - You don't have permission to:
        ${action}${roleError ? ` (${roleError})` : ''}`
    );
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

roles.use('get methods', req => {
  switch (req.user.role) {
    case 'user':
      return onlyAllowedSubjects(req, 'qs.forSubjects');
    default: //
  }
});

roles.use(req => {
  switch (req.user.role) {
    case 'admin':
      return true;
    default: //
  }
});

export default roles;
