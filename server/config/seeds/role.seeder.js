/* eslint-disable max-len */
import Role from '../../models/auth/role.model';
import { resolve } from '../../util/utils';
import _debug from 'debug';

const debug = _debug('app:seeds');

export default {
  run() {
    debug('Run seeds for the Role Model');
    return Role.count({}).exec().then(count => {
      if (count > 0) {
        debug('Roles documents already exists. Seeds not needed.');
        return resolve();
      }

      const seeds = [
        {
          _id: 'admin',
          desc: 'Администратор',
          scopes: [
            'signup:users',
            'read:methods_individuals', 'create:methods_individuals', 'update:methods_individuals', 'delete:methods_individuals',
            'read:methods_types',
            'read:subjects_individuals', 'create:subjects_individuals', 'update:subjects_individuals', 'delete:subjects_individuals',
            'read:subjects_types',
            'read:waste_individuals', 'create:waste_individuals', 'update:waste_individuals', 'delete:waste_individuals',
            'read:waste_types', 'create:waste_types', 'update:waste_types', 'delete:waste_types',
            'read:waste_evidence',
          ],
        },
        {
          _id: 'user',
          desc: 'Пользователь сайта',
          scopes: [
            'read:user_subjects', 'update:user_subjects',
            'read:methods_types',
            'read:subjects_types',
            'read:waste_types',
            'read:waste_evidence',
          ],
        },
      ];

      return new Promise((res, rej) => {
        Role.create(seeds, (err) => {
          if (err) {
            debug(`Error! Seeds for the Role Model are missing. ${err}`);
            rej(err);
          } else {
            debug('OK! Seeds for the Role Model were successfully stored in db');
            res();
          }
        });
      });
    });
  },
};
