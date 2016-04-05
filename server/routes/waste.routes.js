import { Router } from 'express';
import * as Controller from '../controllers/waste.controller';

const router = new Router();

router.get('/:uri', Controller.getWaste);

export default router;
