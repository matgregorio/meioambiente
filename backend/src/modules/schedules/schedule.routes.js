import { Router } from 'express';
import { authenticate, authorize } from '../../middlewares/auth.js';
import {
  createSchedule,
  listSchedules,
  getSchedule,
  completeSchedule,
  deleteSchedule,
  getAvailability,
  listTodaySchedules
} from './schedule.controller.js';
import { upload } from '../uploads/multer.js';
import { scheduleRateLimiter } from '../../middlewares/rateLimit.js';

const router = Router();

router.post('/', scheduleRateLimiter, createSchedule);
router.get('/availability/:type', getAvailability);
router.get('/today', authenticate(), authorize(['admin', 'driver']), listTodaySchedules);
router.get('/', authenticate(), authorize(['admin']), listSchedules);
router.get('/:protocol', authenticate(), authorize(['admin']), getSchedule);
router.patch(
  '/:protocol/complete',
  authenticate(),
  authorize(['admin', 'driver']),
  upload.single('photo'),
  completeSchedule
);
router.delete('/:protocol', authenticate(), authorize(['admin']), deleteSchedule);

export default router;
