import { Router } from 'express';
import * as Controller from '../controllers/auth.controller';

export default (roles) => {
  const router = new Router();

  // New user registration
  router.post('/signup', roles.can('create user'), Controller.signup);

  // Getting the JWT token by an username and password
  router.post('/token', roles.can('get token'), Controller.auth);

  return router;
};
