import { Router } from 'express';
import * as Controller from '../controllers/wastetype.controller';

const router = new Router();

router.get('/', Controller.all);
router.get('/:uri', Controller.get);

export default router;
