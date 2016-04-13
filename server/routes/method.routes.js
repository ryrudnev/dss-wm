import { Router } from 'express';
import * as Controller from '../controllers/method.controller';

const router = new Router();

// Get all individuals of Method entity
// /methods/individuals?expand=['types', 'subject']
// &subtypes=[]&forSubjects=[]&sort=[]&offset&limit
router.get('/individuals', Controller.allIndivids);

// Get the individual of Method entity by FID
// /methods/individuals/:fid?expand=['types', 'subject']
router.get('/individuals/:fid', Controller.individ);

// Get all specific types of Method entity
// /methods/types?
// forWaste=[]&individs=[]&types=[]&subtypes=[]&sort=[]&offset&limit
router.get('/types', Controller.allTypes);

export default router;
