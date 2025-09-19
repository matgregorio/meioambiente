import mongoose from 'mongoose';
import { withAudit } from '../common/baseSchema.js';

const neighborhoodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }
  },
  { versionKey: false }
);

withAudit(neighborhoodSchema);

neighborhoodSchema.index({ name: 1 }, { unique: true });

export const Neighborhood = mongoose.model('Neighborhood', neighborhoodSchema);
