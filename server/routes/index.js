import { Router } from 'express';
import wastes from './waste.routes';

const router = new Router();

router.use('/waste', wastes);

export default router;
