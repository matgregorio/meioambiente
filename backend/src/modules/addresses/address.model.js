import mongoose from 'mongoose';
import { withAudit } from '../common/baseSchema.js';

const addressSchema = new mongoose.Schema(
  {
    neighborhoodId: { type: mongoose.Schema.Types.ObjectId, ref: 'Neighborhood', required: true },
    street: { type: String, required: true }
  },
  { versionKey: false }
);

withAudit(addressSchema, { withUser: true });

addressSchema.index({ street: 1, neighborhoodId: 1 });

export const Address = mongoose.model('Address', addressSchema);
