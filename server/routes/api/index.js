import { Router } from 'express';
import { respondUnauthorized } from '../../util/expressUtils';
import unless from 'express-unless';
import wasteRouter from './waste.routes';
import methodsRouter from './method.routes';
import subjectsRouter from './subject.routes';
import authRouter from './auth.routes';

export default (passport, roles) => {
  const apiRouter = new Router();
  apiRouter.use('/auth', authRouter(roles));
  apiRouter.use('/waste', wasteRouter(roles));
  apiRouter.use('/methods', methodsRouter(roles));
  apiRouter.use('/subjects', subjectsRouter(roles));

  const authJwt = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user) => {
      if (user) {
        req.user = user;
        return next();
      }
      respondUnauthorized.call(res, res.__('Token could not be authenticated'));
    })(req, res, next);
  };
  authJwt.unless = unless;

  const router = new Router();
  router.use(authJwt.unless({ path: '/api/auth/token' }));
  router.use('/api', apiRouter);
  return router;
};
