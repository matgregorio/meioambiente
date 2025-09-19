import mongoose from 'mongoose';

export function withAudit(schema, options = {}) {
  schema.add({
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    deletedAt: { type: Date, default: null }
  });

  if (options.withUser) {
    schema.add({
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    });
  }

  schema.pre('save', function (next) {
    this.updatedAt = new Date();
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
    next();
  });
}

export function excludeDeleted(query) {
  return query.where({ deletedAt: null });
}
