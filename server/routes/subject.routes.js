import { Router } from 'express';
import * as Controller from '../controllers/subject.controller';

const router = new Router();

// Get all individuals of Subject entity
// /subjects/individuals?expand=['types', 'waste', 'methods', 'located']
// &filter={types}&sort&offset&limit
router.get('/individuals', Controller.allIndivids);

// Get the individual of Subject entity by FID
// /subjects/individuals/:fid?expand=['types', 'waste', 'methods', 'located']
router.get('/individuals/:fid', Controller.individ);

// Generate waste management strategy for the subject by FID
router.get('/individuals/:fid/search-strategy', Controller.searchStrategy);

// Get all specific types of Subject entity
// /methods/types?filter={types}&sort&offset&limit
router.get('/types', Controller.allTypes);

// Get all subtypes for type of Subject entity by FID
// /methods/types/:fid/subtypes?sort&offset&limit
router.get('/types/:fid/subtypes', Controller.subtypes);

export default router;
