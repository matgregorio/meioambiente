import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from './user.model.js';
import { env } from '../../config/env.js';
import { AppError } from '../../utils/errors.js';
import { createAuditLog } from '../common/auditLog.js';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve possuir ao menos 6 caracteres')
});

export async function login(req, res, next) {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await User.findOne({ email, deletedAt: null });
    if (!user || !user.isActive) {
      throw new AppError(401, 'Credenciais inválidas');
    }
    const passwordOk = await bcrypt.compare(password, user.passwordHash);
    if (!passwordOk) {
      throw new AppError(401, 'Credenciais inválidas');
    }
    user.lastLoginAt = new Date();
    await user.save();
    const token = jwt.sign({ id: user._id, role: user.role, email: user.email }, env.jwtSecret, {
      expiresIn: '1h'
    });
    await createAuditLog({
      action: 'LOGIN',
      actorUserId: user._id,
      ip: req.ip,
      ua: req.headers['user-agent'],
      entity: 'User',
      entityId: user._id,
      after: { email: user.email, role: user.role }
    });
    res.json({
      token,
      user: { id: user._id, role: user.role, email: user.email }
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return next(new AppError(422, 'Dados inválidos', err.errors));
    }
    return next(err);
  }
}
