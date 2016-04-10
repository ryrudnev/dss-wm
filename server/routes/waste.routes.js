import { Router } from 'express';
import * as Controller from '../controllers/waste.controller';

const router = new Router();

// Получить все индивиды сущности Waste
// /waste/individuals?expand=['types', 'subject']&filter={types, forSubject}&sort&offset&limit
router.get('/individuals', Controller.allIndivids);

// Получить индивид сущности Waste по URI хеш-фргаменту
// /waste/individuals/:fid?expand=['types', 'subject']
router.get('/individuals/:fid', Controller.individ);

// Получить все конкретные подтипы сущности Waste
// /waste/types?expand=['types', 'subject']&filter={types}&sort&offset&limit
router.get('/types', Controller.allTypes);

// Получить все подтипы указаного типа по URI хеш-фргаменту сущности Waste
// /waste/types/:fid/subtypes
router.get('/types/:fid/subtypes', Controller.type);

// Получить все происхождения отходов
// /waste/origins
router.get('/waste/origins', Controller.origins);

// Получить все классы опасности отходов
// /waste/origins
router.get('/waste/hazard-classes', Controller.hazardClasses);

// Получить все агрегатные состояния отходов
// /waste/aggregate-states
router.get('/waste/aggregate-states', Controller.aggregateStates);

export default router;
