import { Router } from 'express';
import * as Controller from '../../controllers/method.controller';

export default (roles) => {
  const router = new Router();

  // Get all individuals of Method entity
  // /methods/individuals?expand=['types', 'subject']
  // &subtypes=[]&forSubjects=[]&sort=[]&offset&limit
  router.get('/individuals', roles.can('get methods'), Controller.getAllIndivids);

  // Create a new individual of Method entity
  router.post('/individuals', roles.can('create method'), Controller.createIndivid);

  // Update an existing individual of Method entity
  router.put('/individuals/:fid', roles.can('update method'), Controller.updateIndivid);

  // Delete an existing individual of Method entity
  // /methods/individuals/:fid?forSubject
  router.delete('/individuals/:fid', roles.can('delete method'), Controller.deleteIndivid);

  // Get the individual of Method entity by FID
  // /methods/individuals/:fid?expand=['types', 'subject']&forSubject
  router.get('/individuals/:fid', roles.can('read method'), Controller.getIndivid);

  // Get all specific types of Method entity
  // /methods/types?
  // forWaste=[]&individs=[]&types=[]&subtypes=[]&sort=[]&offset&limit
  router.get('/types', roles.can('all methods types'), Controller.getAllTypes);

  return router;
};
