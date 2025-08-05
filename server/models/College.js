const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  normalizedName: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['Engineering', 'Medical', 'Management', 'Arts & Science', 'Law', 'Other'],
    default: 'Other'
  },
  location: {
    city: String,
    state: String,
    country: {
      type: String,
      default: 'India'
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isUserAdded: {
    type: Boolean,
    default: true
  },
  addedBy: {
    type: String, // Student phone number who added this college
    required: false
  },
  usageCount: {
    type: Number,
    default: 1
  },
  aliases: [String], // Alternative names for the same college
  website: String,
  establishedYear: Number,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create indexes for efficient searching
collegeSchema.index({ normalizedName: 1 });
collegeSchema.index({ name: 'text' });
collegeSchema.index({ usageCount: -1 });
collegeSchema.index({ isVerified: 1 });

// Update the updatedAt field before saving
collegeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Auto-generate normalized name
  if (this.isModified('name')) {
    this.normalizedName = this.name.toLowerCase().trim();
  }
  
  next();
});

// Static method to find or create college
collegeSchema.statics.findOrCreate = async function(collegeName, addedBy = null) {
  const normalizedName = collegeName.toLowerCase().trim();
  
  // First try to find existing college
  let college = await this.findOne({ normalizedName });
  
  if (college) {
    // Increment usage count
    college.usageCount += 1;
    await college.save();
    return { college, isNew: false };
  }
  
  // Create new college
  college = new this({
    name: collegeName.trim(),
    normalizedName,
    addedBy,
    usageCount: 1
  });
  
  await college.save();
  return { college, isNew: true };
};

// Static method to search colleges
collegeSchema.statics.searchColleges = async function(query, limit = 10) {
  if (!query || query.length < 2) {
    // Return popular colleges when no query
    return await this.find({ usageCount: { $gte: 2 } })
      .sort({ usageCount: -1, name: 1 })
      .limit(limit)
      .select('name category location usageCount');
  }
  
  const searchTerm = query.toLowerCase().trim();
  
  // Use MongoDB text search and regex for flexible matching
  const colleges = await this.find({
    $or: [
      { normalizedName: { $regex: searchTerm, $options: 'i' } },
      { name: { $regex: searchTerm, $options: 'i' } },
      { aliases: { $in: [new RegExp(searchTerm, 'i')] } }
    ]
  })
  .sort({ 
    usageCount: -1,  // Popular colleges first
    name: 1          // Then alphabetical
  })
  .limit(limit)
  .select('name category location usageCount isVerified');
  
  return colleges;
};

// Static method to get popular colleges
collegeSchema.statics.getPopularColleges = async function(limit = 15) {
  return await this.find({ usageCount: { $gte: 2 } })
    .sort({ usageCount: -1, name: 1 })
    .limit(limit)
    .select('name category location usageCount');
};

// Static method to get colleges by region
collegeSchema.statics.getCollegesByRegion = async function(region, limit = 20) {
  const searchTerm = region.toLowerCase();
  
  return await this.find({
    $or: [
      { 'location.city': { $regex: searchTerm, $options: 'i' } },
      { 'location.state': { $regex: searchTerm, $options: 'i' } },
      { normalizedName: { $regex: searchTerm, $options: 'i' } }
    ]
  })
  .sort({ usageCount: -1, name: 1 })
  .limit(limit)
  .select('name category location usageCount');
};

module.exports = mongoose.model('College', collegeSchema);
