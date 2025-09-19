import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import { getTodayStats, getTotalsStats } from '../modules/schedules/stats.controller.js';

const router = Router();

router.use(authenticate(), authorize(['admin']));

router.get('/today', getTodayStats);
router.get('/totals', getTotalsStats);

export default router;
