import Scope, { objToScopes } from '../../models/auth/scope.model';
import _debug from 'debug';

const debug = _debug('app:seeds');

export function initScopeSeeds() {
  const seeds = objToScopes({
    users: [
      { action: 'signup', desc: 'Регестрация новых пользователей' },
    ],
    current_user_subjects: [
      { action: 'read', desc: 'Получение субъектов УО текущего пользователя' },
      { action: 'update', desc: 'Обновление субъектов УО текущего пользователя' },
    ],
    methods_individuals: [
      { action: 'read', desc: 'Получение индивидов сущности "Метод"' },
      { action: 'create', desc: 'Создание индивидов сущности "Метод"' },
      { action: 'update', desc: 'Обновление индивидов сущности "Метод"' },
      { action: 'delete', desc: 'Удаление индивидов сущности "Метод"' },
    ],
    methods_types: [
      { action: 'read', desc: 'Получение типов сущности "Метод"' },
    ],
    subjects_individuals: [
      { action: 'read', desc: 'Получение индивидов сущности "Субъект"' },
      { action: 'create', desc: 'Создание индивидов сущности "Субъект"' },
      { action: 'update', desc: 'Обновление индивидов сущности "Субъект"' },
      { action: 'delete', desc: 'Удаление индивидов сущности "Субъект"' },
    ],
    subjects_types: [
      { action: 'read', desc: 'Получение типов сущности "Субъект"' },
    ],
    waste_individuals: [
      { action: 'read', desc: 'Получение индивидов сущности "Отходы"' },
      { action: 'create', desc: 'Создание индивидов сущности "Отходы"' },
      { action: 'update', desc: 'Обновление индивидов сущности "Отходы"' },
      { action: 'delete', desc: 'Удаление индивидов сущности "Отходы"' },
    ],
    waste_types: [
      { action: 'read', desc: 'Получение типов сущности "Отходы"' },
      { action: 'create', desc: 'Создание типов сущности "Отходы"' },
      { action: 'update', desc: 'Обновление типов сущности "Отходы"' },
      { action: 'delete', desc: 'Удаление типов сущности "Отходы"' },
    ],
    waste_evidence: [
      { action: 'read', desc: 'Получение признаков сущности "Отходы"' },
    ],
  });

  debug('Seeds for Scope model is running...');
  Scope.collection.insert(seeds, (err, docs) => {
    if (err) {
      debug(`Error! Reason: ${err}`);
    } else {
      debug(`OK! Scopes (${docs.length}) were successfully stored in db`);
    }
  });
}
