import { Router } from 'express';
import waste from './waste.routes';
import methods from './method.routes';
import subjects from './subject.routes';

const router = new Router();

router.use('/waste', waste);
router.use('/methods', methods);
router.use('/subjects', subjects);

export default router;
