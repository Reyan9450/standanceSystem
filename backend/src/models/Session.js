const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    startTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['active', 'closed'],
      default: 'active',
      required: true,
    },
    teacherIP: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

sessionSchema.index({ classId: 1, status: 1 });

module.exports = mongoose.model('Session', sessionSchema);
