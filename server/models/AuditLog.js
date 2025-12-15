import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: ['approved', 'rejected'],
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  targetLeave: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Leave',
    required: true,
  },
  details: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('AuditLog', auditLogSchema);
