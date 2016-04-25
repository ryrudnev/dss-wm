import { Router } from 'express';
import * as Controller from '../controllers/waste.controller';

const router = new Router();

// Get all individuals of Waste entity
// /waste/individuals?expand=['types', 'subject']
// &subtypes=[]&forSubjects=[]&sort=[]&offset&limit
router.get('/individuals', Controller.getAllIndivids);

// Create a new individual of Waste entity
router.post('/individuals', Controller.createIndivid);

// Update an existing individual of Waste entity
router.put('/individuals/:fid', Controller.updateIndivid);

// Delete an existing individual of Waste entity
router.delete('/individuals/:fid', Controller.deleteIndivid);

// Get the individual of Waste entity by FID
// /waste/individuals/:fid?expand=['types', 'subject']
router.get('/individuals/:fid', Controller.getIndivid);

// Get all specific types of Waste entity
// /waste/types?
// individs=[]&types=[]&subtypes=[]&sort=[]&offset&limit
router.get('/types', Controller.getAllTypes);

// Create a new type of Waste entity
router.post('/types', Controller.createType);

// Update an existing tyoe of Waste entity
router.put('/types/:fid', Controller.updateType);

// Delete an existing type of Waste entity
router.delete('/types/:fid', Controller.deleteType);

// Get all individuals of Origin entity
// /waste/origins?sort&offset&limit
router.get('/origins', Controller.getOrigins);

// Get all individuals of HazardClass entity
// /waste/hazard-classes?sort&offset&limit
router.get('/hazard-classes', Controller.getHazardClasses);

// Get all individuals of AggregateState entity
// /waste/aggregate-states?sort&offset&limit
router.get('/aggregate-states', Controller.getAggregateStates);

export default router;
