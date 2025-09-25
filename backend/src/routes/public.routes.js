import { Router } from 'express';
import { publicVerificationRateLimiter } from '../middlewares/rateLimit.js';
import { verifySchedule } from '../modules/schedules/schedule.controller.js';
import { listPublicAddresses } from '../modules/addresses/address.controller.js';

const router = Router();

router.get('/verify/:protocol', publicVerificationRateLimiter, verifySchedule);
router.get('/public/addresses', listPublicAddresses);

export default router;