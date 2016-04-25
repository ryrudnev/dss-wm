import { Router } from 'express';
import * as Controller from '../controllers/subject.controller';

const router = new Router();

// Get all individuals of Subject entity
// /subjects/individuals?expand=['types', 'waste', 'methods', 'located']
// &subtypes=[]&byMethods=[]&byWaste=[]&sort=[]&offset&limit
router.get('/individuals', Controller.getAllIndivids);

// Create a new individual of Subject entity
router.post('/individuals', Controller.createIndivid);

// Update an existing individual of Subject entity
router.put('/individuals/:fid', Controller.updateIndivid);

// Delete an existing individual of Subject entity
router.delete('/individuals/:fid', Controller.deleteIndivid);

// Get the individual of Subject entity by FID
// /subjects/individuals/:fid?expand=['types', 'waste', 'methods', 'located']
router.get('/individuals/:fid', Controller.getIndivid);

// Generate waste management strategy for the subject by FID
router.get('/individuals/:fid/search-strategy', Controller.searchStrategy);

// Get all strategies for the subject by FID
router.get('/individuals/:fid/strategies', Controller.getStrategies);

// Get all specific types of Subject entity
// /subjects/types?
// individs=[]&types=[]&subtypes=[]&sort=[]&offset&limit
router.get('/types', Controller.getAllTypes);

export default router;
