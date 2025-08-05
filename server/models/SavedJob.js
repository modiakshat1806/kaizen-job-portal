const mongoose = require('mongoose');

const savedJobSchema = new mongoose.Schema({
  studentPhone: {
    type: String,
    required: true,
    trim: true
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
  jobDetails: {
    description: String,
    location: String,
    salary: {
      min: Number,
      max: Number,
      period: String
    },
    jobType: String,
    industry: String,
    requirements: {
      education: String,
      experience: {
        min: Number,
        max: Number
      },
      skills: [String]
    }
  },
  savedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate saves
savedJobSchema.index({ studentPhone: 1, jobId: 1 }, { unique: true });
savedJobSchema.index({ studentPhone: 1 });
savedJobSchema.index({ savedAt: -1 });

module.exports = mongoose.model('SavedJob', savedJobSchema);
