const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      required: true,
    },
    status: {
      type: String,
      enum: ['present', 'late', 'absent'],
      required: true,
    },
    verification: {
      type: String,
      enum: ['verified', 'unverified', 'teacher-approved'],
      required: true,
    },
    source: {
      type: String,
      enum: ['wifi', 'manual', 'qr', 'system'],
      required: true,
    },
    time: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Unique compound index — prevents duplicate attendance per student per session
attendanceSchema.index({ studentId: 1, sessionId: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
