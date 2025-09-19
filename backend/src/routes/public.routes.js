import { Router } from 'express';
import { verifySchedule } from '../modules/schedules/schedule.controller.js';
import { listPublicAddresses } from '../modules/addresses/address.controller.js';

const router = Router();

router.get('/verify/:protocol', verifySchedule);
router.get('/public/addresses', listPublicAddresses);

export default router;
