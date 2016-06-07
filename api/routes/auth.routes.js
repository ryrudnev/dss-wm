import { Router } from 'express';
import * as Controller from '../controllers/auth.controller';

export default (roles) => {
  const router = new Router();

  router.get('/users', roles.can('get users'), Controller.getUsers);

  router.post('/users', roles.can('create user'), Controller.signup);

  router.get('/users/:id', roles.can('get user'), Controller.getUser);

  router.put('/users/:id', roles.can('update user'), Controller.updateUser);

  router.delete('/users/:id', roles.can('delete user'), Controller.deleteUser);

  // New user registration
  router.post('/signup', roles.can('create user'), Controller.signup);

  // Getting the JWT token by an username and password
  router.post('/token', roles.can('get token'), Controller.auth);

  return router;
};
