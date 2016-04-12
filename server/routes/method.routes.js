import { Router } from 'express';
import * as Controller from '../controllers/method.controller';

const router = new Router();

// Get all individuals of Method entity
// /waste/individuals?expand=['types', 'subject']&filter={types, forSubject}&sort&offset&limit
router.get('/individuals', Controller.allIndivids);

// Get the individual of Method entity by FID
// /waste/individuals/:fid?expand=['types', 'subject']
router.get('/individuals/:fid', Controller.individ);

// Get all specific types of Method entity
// /waste/types?filter={types}&sort&offset&limit
router.get('/types', Controller.allTypes);

// Get all subtypes for type of Method entity by FID
// /waste/types/:fid/subtypes?sort&offset&limit
router.get('/types/:fid/subtypes', Controller.subtypes);

export default router;