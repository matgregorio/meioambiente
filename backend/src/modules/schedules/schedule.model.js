import mongoose from 'mongoose';
import { withAudit } from '../common/baseSchema.js';

const scheduleSchema = new mongoose.Schema(
  {
    protocol: { type: String, required: true, unique: true },
    type: { type: String, enum: ['poda', 'moveis', 'vidro-eletronicos'], required: true },
    date: { type: Date, required: true },
    addressId: { type: mongoose.Schema.Types.ObjectId, ref: 'Address', required: true },
    neighborhoodName: { type: String, required: true },
    addressText: { type: String, required: true },
    requesterName: { type: String, required: true },
    cpfCnpj: { type: String, required: true },
    phone: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['Agendado', 'Concluído'], default: 'Agendado' },
    driverPhotoUrl: { type: String },
    qrcodePayload: { type: String, required: true },
    createdByIp: { type: String },
    userAgent: { type: String }
  },
  { versionKey: false }
);

withAudit(scheduleSchema);

scheduleSchema.index({ date: 1, type: 1, status: 1 });
scheduleSchema.index({ protocol: 1 });
scheduleSchema.index({ addressText: 'text', requesterName: 'text' });

export const Schedule = mongoose.model('Schedule', scheduleSchema);
