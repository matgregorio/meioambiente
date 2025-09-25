import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

const defaultOptions = {
  standardHeaders: true,
  legacyHeaders: false
};

export const scheduleRateLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMax,
  message: 'Limite de agendamentos atingido. Tente novamente mais tarde.',
  ...defaultOptions
});

export const authRateLimiter = rateLimit({
  windowMs: env.rateLimitAuthWindowMs,
  max: env.rateLimitAuthMax,
  message: 'Limite de tentativas de login atingido. Tente novamente mais tarde.',
  ...defaultOptions
});

export const publicVerificationRateLimiter = rateLimit({
  windowMs: env.rateLimitVerifyWindowMs,
  max: env.rateLimitVerifyMax,
  message: 'Muitas consultas de verificacao. Tente novamente mais tarde.',
  ...defaultOptions
});