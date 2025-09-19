import mongoose from 'mongoose';
import { withAudit } from '../common/baseSchema.js';

const userSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['admin', 'driver'], required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date }
  },
  { versionKey: false }
);

withAudit(userSchema);

userSchema.index({ email: 1 }, { unique: true });

export const User = mongoose.model('User', userSchema);
