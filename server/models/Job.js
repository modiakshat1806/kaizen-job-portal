const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const jobSchema = new mongoose.Schema({
  jobId: {
    type: String,
    default: () => `JOB_${uuidv4().substring(0, 8).toUpperCase()}`,
    unique: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    logo: String,
    description: String,
    website: String
  },
  description: {
    type: String,
    required: true
  },
  requirements: {
    education: {
      type: String,
      required: true,
      enum: ['High School', 'Bachelor', 'Master', 'PhD', 'Diploma', 'Any']
    },
    experience: {
      min: {
        type: Number,
        default: 0
      },
      max: Number
    },
    skills: [String],
    certifications: [String]
  },
  responsibilities: [String],
  benefits: [String],
  location: {
    type: {
      type: String,
      enum: ['Remote', 'On-site', 'Hybrid'],
      default: 'On-site'
    },
    city: String,
    state: String,
    country: String,
    address: String
  },
  salary: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'USD'
    },
    period: {
      type: String,
      enum: ['Hourly', 'Monthly', 'Yearly'],
      default: 'Yearly'
    }
  },
  jobType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'],
    required: true
  },
  industry: {
    type: String,
    required: true
  },
  department: String,
  applicationDeadline: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  applicationCount: {
    type: Number,
    default: 0
  },
  qrCode: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
jobSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Generate QR code URL for the job
jobSchema.methods.generateQRCode = function() {
  const jobUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/job/${this.jobId}`;
  return jobUrl;
};

module.exports = mongoose.model('Job', jobSchema); 