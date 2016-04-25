import { Router } from 'express';
import * as Controller from '../controllers/method.controller';

const router = new Router();

// Get all individuals of Method entity
// /methods/individuals?expand=['types', 'subject']
// &subtypes=[]&forSubjects=[]&sort=[]&offset&limit
router.get('/individuals', Controller.getAllIndivids);

// Create a new individual of Method entity
router.post('/individuals', Controller.createIndivid);

// Update an existing individual of Method entity
router.put('/individuals/:fid', Controller.updateIndivid);

// Delete an existing individual of Method entity
router.delete('/individuals/:fid', Controller.deleteIndivid);

// Get the individual of Method entity by FID
// /methods/individuals/:fid?expand=['types', 'subject']
router.get('/individuals/:fid', Controller.getIndivid);

// Get all specific types of Method entity
// /methods/types?
// forWaste=[]&individs=[]&types=[]&subtypes=[]&sort=[]&offset&limit
router.get('/types', Controller.getAllTypes);

export default router;
