import { Router } from 'express';
import * as Controller from '../controllers/user.controller';

const router = new Router();

router.post('/signup', Controller.signup);
router.post('/auth', Controller.authenticate);

export default router;
