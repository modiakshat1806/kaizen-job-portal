const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  education: {
    degree: {
      type: String,
      required: true,
      enum: ['High School', 'Bachelor', 'Master', 'PhD', 'Diploma', 'Other']
    },
    field: {
      type: String,
      required: true
    },
    institution: {
      type: String,
      required: true
    },
    graduationYear: {
      type: Number,
      required: true
    }
  },
  skills: [{
    name: String,
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert']
    }
  }],
  experience: {
    years: {
      type: Number,
      default: 0
    },
    internships: [{
      company: String,
      role: String,
      duration: String,
      description: String
    }],
    projects: [{
      title: String,
      description: String,
      technologies: [String],
      link: String
    }]
  },
  interests: [String],
  careerGoals: {
    type: String,
    required: true
  },
  preferredLocation: [String],
  salaryExpectation: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  assessmentScore: {
    technical: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    communication: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    problemSolving: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    teamwork: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },
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
studentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Student', studentSchema); 