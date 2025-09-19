import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import scheduleRoutes from '../modules/schedules/schedule.routes.js';
import addressRoutes from '../modules/addresses/address.routes.js';
import publicRoutes from './public.routes.js';
import statsRoutes from './stats.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/schedules', scheduleRoutes);
router.use('/addresses', addressRoutes);
router.use('/stats', statsRoutes);
router.use('/', publicRoutes);

export default router;
