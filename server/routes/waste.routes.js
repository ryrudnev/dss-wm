import { Router } from 'express';
import * as Controller from '../controllers/waste.controller';

const router = new Router();

// Get all individuals of Waste entity
// /waste/individuals?expand=['types', 'subject']&filter={types, forSubject}&sort&offset&limit
router.get('/individuals', Controller.allIndivids);

// Get the individual of Waste entity by FID
// /waste/individuals/:fid?expand=['types', 'subject']
router.get('/individuals/:fid', Controller.individ);

// Get all specific types of Waste entity
// /waste/types?filter={types}&sort&offset&limit
router.get('/types', Controller.allTypes);

// Get all subtypes for type of Waste entity by FID
// /waste/types/:fid/subtypes
router.get('/types/:fid/subtypes', Controller.subtypes);

// Get all individuals of Origin entity
// /waste/origins
router.get('/waste/origins', Controller.origins);

// Get all individuals of HazardClass entity
// /waste/origins
router.get('/waste/hazard-classes', Controller.hazardClasses);

// Get all individuals of AggregateState entity
// /waste/aggregate-states
router.get('/waste/aggregate-states', Controller.aggregateStates);

export default router;
