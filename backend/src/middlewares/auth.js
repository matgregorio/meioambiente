import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../utils/errors.js';

export function authenticate(required = true) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      if (!required) return next();
      return next(new AppError(401, 'Token não fornecido'));
    }
    try {
      const decoded = jwt.verify(token, env.jwtSecret);
      req.user = decoded;
      return next();
    } catch (err) {
      return next(new AppError(401, 'Token inválido'));
    }
  };
}

export function authorize(roles = []) {
  return (req, res, next) => {
    if (!req.user) return next(new AppError(401, 'Não autorizado'));
    if (roles.length && !roles.includes(req.user.role)) {
      return next(new AppError(403, 'Acesso negado'));
    }
    return next();
  };
}
