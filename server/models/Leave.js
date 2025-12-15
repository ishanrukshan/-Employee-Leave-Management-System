import mongoose from 'mongoose';
import Counter from './Counter.js';

const leaveSchema = new mongoose.Schema(
  {
    leaveId: {
      type: String,
      unique: true,
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Please add a start date'],
    },
    endDate: {
      type: Date,
      required: [true, 'Please add an end date'],
    },
    totalDays: {
      type: Number,
    },
    reason: {
      type: String,
      required: [true, 'Please add a reason for leave'],
      minlength: [10, 'Reason must be at least 10 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    adminComment: {
      type: String,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Generate leaveId before saving 
leaveSchema.pre('save', async function () {
  if (this.isNew && !this.leaveId) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: 'leaveId' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.leaveId = `LV-${String(counter.seq).padStart(4, '0')}`;
  }
});

// Calculate total days before saving
leaveSchema.pre('save', function () {
  if (this.startDate && this.endDate) {
    // Validate end date is not before start date
    if (this.endDate < this.startDate) {
      throw new Error('End date cannot be before start date');
    }
    
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    this.totalDays = diffDays;
  }
});

export default mongoose.model('Leave', leaveSchema);
