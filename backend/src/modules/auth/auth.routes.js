import { Router } from 'express';
import { authRateLimiter } from '../../middlewares/rateLimit.js';
import { login } from './auth.controller.js';

const router = Router();

router.post('/login', authRateLimiter, login);

export default router;