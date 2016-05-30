import { Router } from 'express';
import * as Controller from '../controllers/subject.controller';

export default (roles) => {
  const router = new Router();

  // Get all individuals of Subject entity
  // /subjects/individuals?expand=['types', 'waste', 'methods', 'located']
  // &fids=[]&subtypes=[]&byMethods=[]&byWaste=[]&sort=[]&offset&limit
  router.get('/individuals', roles.can('get subjects'), Controller.getAllIndivids);

  // Create a new individual of Subject entity
  router.post('/individuals', roles.can('create subject'), Controller.createIndivid);

  // Update an existing individual of Subject entity
  router.put('/individuals/:fid', roles.can('update subject'), Controller.updateIndivid);

  // Delete an existing individual of Subject entity
  router.delete('/individuals/:fid', roles.can('delete subject'), Controller.deleteIndivid);

  // Get the individual of Subject entity by FID
  // /subjects/individuals/:fid?expand=['types', 'waste', 'methods', 'located']
  router.get('/individuals/:fid', roles.can('read subject'), Controller.getIndivid);

  // Generate waste management strategy for the subject by FID
  router.get('/individuals/:fid/search-strategy', roles.can('read subject'), Controller.searchStrategy); // eslint-disable-line

  // Get all specific types of Subject entity
  // /subjects/types?
  // individs=[]&types=[]&subtypes=[]&sort=[]&offset&limit
  router.get('/types', roles.can('all subjects types'), Controller.getAllTypes);

  return router;
};
