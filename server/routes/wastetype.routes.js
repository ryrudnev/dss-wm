import { Router } from 'express';
import * as Controller from '../controllers/wastetype.controller';

const router = new Router();

router.get('/', Controller.getWasteTypes);
router.get('/:uri', Controller.getWasteType);

export default router;
