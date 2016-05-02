import _debug from 'debug';
import ScopeSeeder from './scope.seeder';
import RoleSeeder from './role.seeder';
import UserSeeder from './user.seeder';

const debug = _debug('app:seeds');

export default function init() {
  ScopeSeeder.run()
      .then(() => RoleSeeder.run())
      .then(() => UserSeeder.run())
      .then(() => debug('All seeds is completed'))
      .catch(err => debug(`Seeds error. ${err}`));
}
