const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema({
  studentPhone: {
    type: String,
    required: true,
    trim: true
  },
  studentName: {
    type: String,
    required: true,
    trim: true
  },
  studentEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  jobId: {
    type: String,
    required: true,
    trim: true
  },
  jobTitle: {
    type: String,
    required: true,
    trim: true
  },
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  fitmentScore: {
    type: Number,
    min: 0,
    max: 100
  },
  status: {
    type: String,
    enum: ['applied', 'reviewed', 'shortlisted', 'rejected', 'hired'],
    default: 'applied'
  },
  studentDetails: {
    education: {
      degree: String,
      institution: String,
      graduationYear: Number,
      field: String
    },
    skills: [String],
    experience: {
      years: Number,
      description: String
    },
    assessmentScore: {
      technical: Number,
      communication: Number,
      problemSolving: Number,
      teamwork: Number
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
jobApplicationSchema.index({ studentPhone: 1 });
jobApplicationSchema.index({ jobId: 1 });
jobApplicationSchema.index({ companyName: 1 });
jobApplicationSchema.index({ appliedAt: -1 });

module.exports = mongoose.model('JobApplication', jobApplicationSchema);

