import { logger } from '../config/logger.js';

export function errorHandler(err, req, res, next) {
  const status = err.statusCode || 500;
  const payload = {
    message: err.message || 'Erro interno do servidor'
  };
  if (err.details) {
    payload.details = err.details;
  }
  logger.error(err);
  res.status(status).json(payload);
}
