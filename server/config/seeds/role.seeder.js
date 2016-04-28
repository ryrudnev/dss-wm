/* eslint-disable max-len */
import Role from '../../models/auth/role.model';
import _debug from 'debug';

const debug = _debug('app:seeds');

export function initScopeSeeds() {
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
        'read:current_user_subjects', 'update:current_user_subjects',
        'read:methods_types',
        'read:subjects_types',
        'read:waste_types',
        'read:waste_evidence',
      ],
    },
    {
      _id: 'guest',
      desc: 'Гость сайта',
      scopes: [],
    },
  ];

  debug('Seeds for Role model is running...');
  Role.collection.insert(seeds, (err, docs) => {
    if (err) {
      debug(`Error! Reason: ${err}`);
    } else {
      debug(`OK! Roles (${docs.length}) were successfully stored in db`);
    }
  });
}