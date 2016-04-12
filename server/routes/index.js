import { Router } from 'express';
import waste from './waste.routes';
import methods from './method.routes';

const router = new Router();

router.use('/waste', waste);
router.use('/methods', methods);

export default router;
