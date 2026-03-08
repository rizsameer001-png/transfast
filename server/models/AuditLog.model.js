import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  actorRole: { type: String },
  action: { type: String, required: true },
  resource: { type: String },
  resourceId: { type: String },
  details: { type: mongoose.Schema.Types.Mixed },
  ipAddress: { type: String },
  userAgent: { type: String },
  result: { type: String, enum: ['success', 'failure', 'warning'], default: 'success' },
}, { timestamps: true });

auditLogSchema.index({ actor: 1, createdAt: -1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ createdAt: -1 });

export default mongoose.model('AuditLog', auditLogSchema);
