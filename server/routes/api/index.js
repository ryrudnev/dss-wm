import { Router } from 'express';
import { respondUnauthorized } from '../../util/expressUtils';
import unless from 'express-unless';
import waste from './waste.routes';
import methods from './method.routes';
import subjects from './subject.routes';
import auth from './auth.routes';

const subrouter = new Router();
subrouter.use('/auth', auth);
subrouter.use('/waste', waste);
subrouter.use('/methods', methods);
subrouter.use('/subjects', subjects);

export default passport => {
  const apiRouter = new Router();

  const authJwt = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user) => {
      if (user) {
        req.user = user;
        return next();
      }
      respondUnauthorized.call(res, 'Token could not be authenticated');
    })(req, res, next);
  };
  authJwt.unless = unless;

  apiRouter.use(authJwt.unless({ path: '/api/auth/token' }));

  apiRouter.use('/api', subrouter);

  return apiRouter;
};
