import { Router } from 'express';
import * as Controller from '../controllers/waste.controller';

export default (roles) => {
  const router = new Router();

  // Get all individuals of Waste entity
  // /waste/individuals?expand=['types', 'subject']
  // &subtypes=[]&forSubjects=[]&sort=[]&offset&limit
  router.get('/individuals', roles.can('get waste'), Controller.getAllIndivids);

  // Create a new individual of Waste entity
  router.post('/individuals', roles.can('create waste'), Controller.createIndivid);

  // Update an existing individual of Waste entity
  router.put('/individuals/:fid', roles.can('update waste'), Controller.updateIndivid);

  // Delete an existing individual of Waste entity
  // /waste/individuals/:fid?forSubject
  router.delete('/individuals/:fid', roles.can('delete waste'), Controller.deleteIndivid);

  // Get the individual of Waste entity by FID
  // /waste/individuals/:fid?expand=['types', 'subject']&forSubject
  router.get('/individuals/:fid', roles.can('read waste'), Controller.getIndivid);

  // Get all specific types of Waste entity
  // /waste/types?
  // individs=[]&types=[]&subtypes=[]&sort=[]&offset&limit
  router.get('/types', roles.can('all wastes types'), Controller.getAllTypes);

  router.get('/types/:fid', roles.can('get waste type'), Controller.getType);

  // Create a new type of Waste entity
  router.post('/types', roles.can('create waste type'), Controller.createType);

  // Update an existing tyoe of Waste entity
  router.put('/types/:fid', roles.can('update waste type'), Controller.updateType);

  // Delete an existing type of Waste entity
  router.delete('/types/:fid', roles.can('delete waste type'), Controller.deleteType);

  // Get all individuals of Origin entity
  // /waste/origins?sort&offset&limit
  router.get('/origins', roles.can('all waste evidence'), Controller.getOrigins);

  // Get all individuals of HazardClass entity
  // /waste/hazard-classes?sort&offset&limit
  router.get('/hazard-classes', roles.can('all waste evidence'), Controller.getHazardClasses);

  // Get all individuals of AggregateState entity
  // /waste/aggregate-states?sort&offset&limit
  router.get('/aggregate-states', roles.can('all waste evidence'), Controller.getAggregateStates);

  return router;
};
