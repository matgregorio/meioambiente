import mongoose from 'mongoose';
import { withAudit } from './baseSchema.js';

const auditSchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    actorUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ip: String,
    ua: String,
    entity: { type: String, required: true },
    entityId: { type: mongoose.Schema.Types.ObjectId },
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed,
    createdAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

withAudit(auditSchema);

auditSchema.index({ action: 1, entity: 1, createdAt: -1 });

export const AuditLog = mongoose.model('AuditLog', auditSchema);

export async function createAuditLog(payload) {
  await AuditLog.create(payload);
}
