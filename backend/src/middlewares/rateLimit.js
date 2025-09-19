import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

export const scheduleRateLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMax,
  message: 'Limite de agendamentos atingido. Tente novamente mais tarde.'
});
