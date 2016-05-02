/* eslint-disable max-len */
import User from '../../models/auth/user.model';
import { resolve } from '../../util/utils';
import _debug from 'debug';

const debug = _debug('app:seeds');

export default {
  run() {
    debug('Run seeds for the User Model');
    return User.count({}).exec().then(count => {
      if (count > 0) {
        debug('Users documents already exists. Seeds not needed.');
        return resolve();
      }

      const seeds = [
        {
          email: 'admin@mail.example',
          username: 'admin',
          password: 'admin',
          roles: ['admin'],
        },
        {
          email: 'test@mail.example',
          username: 'test',
          password: 'test',
          roles: ['user'],
          subjects: ['e6', 'e5'],
        },
      ];

      return new Promise((res, rej) => {
        User.create(seeds, (err) => {
          if (err) {
            debug(`Error! Seeds for the User Model are missing. ${err}`);
            rej(err);
          } else {
            debug('OK! Seeds for the User Model were successfully stored in db');
            res();
          }
        });
      });
    });
  },
};
