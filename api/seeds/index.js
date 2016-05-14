import _debug from 'debug';
import UserSeeder from './user.seeder';

const debug = _debug('api:seeds');

export default function init() {
  UserSeeder.run()
      .then(() => debug('All seeds is completed'))
      .catch(err => debug(`Seeds error. ${err}`));
}
