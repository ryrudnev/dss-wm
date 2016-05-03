import Scope, { objToScopes } from '../../models/auth/scope.model';
import { resolve, Deferred } from '../../util/utils';
import _debug from 'debug';

const debug = _debug('app:seeds');

export default {
  run() {
    debug('Run seeds for the Scope Model');
    return Scope.count({}).exec().then(count => {
      if (count > 0) {
        debug('Scopes documents already exists. Seeds not needed.');
        return resolve();
      }

      const seeds = objToScopes({
        users: [
          { action: 'signup', desc: 'Регестрация новых пользователей' },
        ],

        user_subjects: [
          { action: 'read', desc: 'Получение субъектов пользователя' },
          { action: 'update', desc: 'Обновление субъектов пользователя' },
        ],

        methods_individuals: [
          { action: 'read', desc: 'Получение индивидов сущности Метод' },
          { action: 'create', desc: 'Создание индивидов сущности Метод' },
          { action: 'update', desc: 'Обновление индивидов сущности Метод' },
          { action: 'delete', desc: 'Удаление индивидов сущности Метод' },
        ],

        methods_types: [
          { action: 'read', desc: 'Получение типов сущности Метод' },
        ],

        subjects_individuals: [
          { action: 'read', desc: 'Получение индивидов сущности Субъект' },
          { action: 'create', desc: 'Создание индивидов сущности Субъект' },
          { action: 'update', desc: 'Обновление индивидов сущности Субъект' },
          { action: 'delete', desc: 'Удаление индивидов сущности Субъект' },
        ],

        subjects_types: [
          { action: 'read', desc: 'Получение типов сущности Субъект' },
        ],

        waste_individuals: [
          { action: 'read', desc: 'Получение индивидов сущности Отходы' },
          { action: 'create', desc: 'Создание индивидов сущности Отходы' },
          { action: 'update', desc: 'Обновление индивидов сущности Отходы' },
          { action: 'delete', desc: 'Удаление индивидов сущности Отходы' },
        ],

        waste_types: [
          { action: 'read', desc: 'Получение типов сущности Отходы' },
          { action: 'create', desc: 'Создание типов сущности Отходы' },
          { action: 'update', desc: 'Обновление типов сущности Отходы' },
          { action: 'delete', desc: 'Удаление типов сущности Отходы' },
        ],

        waste_evidence: [
          { action: 'read', desc: 'Получение признаков сущности Отходы' },
        ],
      });

      const dfd = new Deferred();
      Scope.create(seeds, (err) => {
        if (err) {
          debug(`Error! Seeds for the Scope Model are missing. ${err}`);
          dfd.reject(err);
        } else {
          debug('OK! Seeds for the Scope Model were successfully stored in db');
          dfd.resolve();
        }
      });
      return dfd.promise;
    });
  },
};
