import ConnectRoles from 'connect-roles';
import _debug from 'debug';
import objectPath from 'object-path';
import { respondForbidden } from '../util/expressUtils';
import { intersectArray, isFunction, isBool, flatten } from '../util/utils';

const debug = _debug('app:roles');

// Get only allowed subjects for the user.
function allowedSubjects(req, subjectsPath) {
  const subjects = objectPath.get(req, subjectsPath, false);
  if (!subjects) {
    req.roleError = 'You must specify enterprises';
    return false;
  }
  const allowed = intersectArray(req.user.subjects, subjects);
  if (!allowed.length) {
    req.roleError = 'No solution for you enterprises';
    return false;
  }
  if (~subjectsPath.indexOf('forSubjects')) {
    objectPath.set(req, subjectsPath, allowed);
  } else if (~subjectsPath.indexOf('forSubject')) {
    objectPath.set(req, subjectsPath, allowed[0]);
  }
  return true;
}

// If-then conditional by a role
function ifRole(req, role, thenCond = true, elseCond = void 0) {
  if (req.user.role === role) {
    return isFunction(thenCond) ? thenCond(req) : thenCond;
  }
  return isFunction(elseCond) ? elseCond(req) : elseCond;
}

// Set rules for roles
const rulesRoles = {
  // global rules, without a specific role
  globalRules: [
    // If user is not authenticated then he can access to only getting token
    (req, action) => (!req.isAuthenticated() ? action === 'get token' : void 0),

    // Admin can access to all routes
    req => ifRole(req, 'admin'),
  ],

  // role => [rule]
  actionRules: {
    'get methods': req => ifRole(req, 'user', () => allowedSubjects(req, 'qs.forSubjects')),
    'create method': req => ifRole(req, 'user', () => allowedSubjects(req, 'body.forSubject')),
    'update method': req => ifRole(req, 'user', () => allowedSubjects(req, 'body.forSubject')),
    'delete method': req => ifRole(req, 'user', () => allowedSubjects(req, 'qs.forSubject')),
    'read method': req => ifRole(req, 'user', () => allowedSubjects(req, 'qs.forSubject')),
    'all methods types': () => true,

    'get wastes': req => ifRole(req, 'user', () => allowedSubjects(req, 'qs.forSubjects')),
    'create waste': req => ifRole(req, 'user', () => allowedSubjects(req, 'body.forSubject')),
    'update waste': req => ifRole(req, 'user', () => allowedSubjects(req, 'body.forSubject')),
    'delete waste': req => ifRole(req, 'user', () => allowedSubjects(req, 'qs.forSubject')),
    'read waste': req => ifRole(req, 'user', () => allowedSubjects(req, 'qs.forSubject')),
    'all wastes types': () => true,
    'all waste evidence': () => true,

    'get subjects': req => ifRole(req, 'user', () => allowedSubjects(req, 'qs.fids')),
    'update subject': req => ifRole(req, 'user', () => allowedSubjects(req, 'params.fid')),
    'read subject': req => ifRole(req, 'user', () => allowedSubjects(req, 'params.fid')),
    'all subjects types': () => true,
  },
};

const roles = new ConnectRoles({
  failureHandler({ user = {}, roleError }, res, action) {
    const error = roleError ? ` (${roleError})` : '';
    debug(`Access denied for user '${user.username}' to do action '${action}'${error}`);
    respondForbidden.call(res, `Access denied. You don't have permission to '${action}'${error}`);
  },
  async: true,

  userProperty: 'user',

  matchRelativePaths: false,
});

const { globalRules = [], actionRules = {} } = rulesRoles;

flatten([globalRules]).forEach(rule => roles.use(rule));

Object.keys(actionRules).forEach(action =>
  roles.use(action, req => {
    for (const rule of flatten([actionRules[action]])) {
      const res = rule(req);
      if (isBool(res)) {
        return res;
      }
    }
  })
);

export default roles;
