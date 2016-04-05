import { Router } from 'express';
import wastes from './waste.routes';
import wastetypes from './wastetype.routes';

const router = new Router();

router.use('/wastes', wastes);
router.use('/wastetypes', wastetypes);

export default router;
