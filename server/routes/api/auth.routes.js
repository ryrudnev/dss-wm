import { Router } from 'express';
import * as Controller from '../../controllers/auth.controller';

const router = new Router();

// New user registration
router.post('/signup', Controller.signup);

// Getting the JWT token by an username and password
router.post('/token', Controller.auth);

export default router;
