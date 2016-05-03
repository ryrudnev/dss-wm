import { Router } from 'express';
import * as Controller from '../../controllers/auth.controller';

const router = new Router();

// New user registration
router.post('/signup', Controller.signup);

// Getting the JWT token by an username and password
router.post('/token', Controller.auth);

// Getting permissions for an extracted user from the JWT token
router.get('/permissions', Controller.getPermissions);

export default router;
