import { Router } from 'express';
import * as WasteController from '../controllers/waste.controller';

const router = new Router();

router.route('/wastes').get(WasteController.getWastes);

export default router;
