/* eslint-disable max-len */
import User from '../models/user.model';
import { Deferred } from '../util/utils';
import _debug from 'debug';

const debug = _debug('api:seeds:user');

export default {
  run() {
    debug('Run seeds for the User Model');
    return User.count({}).exec().then(count => {
      if (count > 0) {
        debug('Users documents already exists. Seeds not needed.');
        return Promise.resolve();
      }

      const seeds = [
        {
          email: 'admin@mail.example',
          username: 'admin',
          password: 'admin',
          role: 'admin',
        },
        {
          email: 'test@mail.example',
          username: 'test',
          password: 'test',
          role: 'user',
          subjects: ['e6', 'e5'],
        },
      ];

      const dfd = new Deferred();
      User.create(seeds, (err) => {
        if (err) {
          debug(`Error! Seeds for the User Model are missing. ${err}`);
          dfd.reject(err);
        } else {
          debug('OK! Seeds for the User Model were successfully stored in db');
          dfd.resolve();
        }
      });
      return dfd.promise;
    });
  },
};
