const mongoose = require('mongoose');
const College = require('../models/College');

// Import the static college data
const { indianColleges } = require('../../client/src/data/indianColleges');

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kaizen-job-portal');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Function to categorize colleges
const categorizeCollege = (collegeName) => {
  const name = collegeName.toLowerCase();
  
  if (name.includes('medical') || name.includes('aiims') || name.includes('hospital')) {
    return 'Medical';
  }
  if (name.includes('iim') || name.includes('management') || name.includes('business') || name.includes('isb')) {
    return 'Management';
  }
  if (name.includes('law') || name.includes('juridical')) {
    return 'Law';
  }
  if (name.includes('arts') || name.includes('science') || name.includes('commerce') && !name.includes('engineering')) {
    return 'Arts & Science';
  }
  if (name.includes('engineering') || name.includes('technology') || name.includes('iit') || 
      name.includes('nit') || name.includes('iiit') || name.includes('institute of technology')) {
    return 'Engineering';
  }
  
  return 'Other';
};

// Function to extract location from college name
const extractLocation = (collegeName) => {
  const name = collegeName.toLowerCase();
  const location = { city: '', state: '', country: 'India' };
  
  // Common city mappings
  const cityMappings = {
    'mumbai': { city: 'Mumbai', state: 'Maharashtra' },
    'bombay': { city: 'Mumbai', state: 'Maharashtra' },
    'delhi': { city: 'Delhi', state: 'Delhi' },
    'bangalore': { city: 'Bangalore', state: 'Karnataka' },
    'bengaluru': { city: 'Bangalore', state: 'Karnataka' },
    'chennai': { city: 'Chennai', state: 'Tamil Nadu' },
    'madras': { city: 'Chennai', state: 'Tamil Nadu' },
    'hyderabad': { city: 'Hyderabad', state: 'Telangana' },
    'kolkata': { city: 'Kolkata', state: 'West Bengal' },
    'calcutta': { city: 'Kolkata', state: 'West Bengal' },
    'pune': { city: 'Pune', state: 'Maharashtra' },
    'ahmedabad': { city: 'Ahmedabad', state: 'Gujarat' },
    'jaipur': { city: 'Jaipur', state: 'Rajasthan' },
    'lucknow': { city: 'Lucknow', state: 'Uttar Pradesh' },
    'kanpur': { city: 'Kanpur', state: 'Uttar Pradesh' },
    'nagpur': { city: 'Nagpur', state: 'Maharashtra' },
    'indore': { city: 'Indore', state: 'Madhya Pradesh' },
    'bhopal': { city: 'Bhopal', state: 'Madhya Pradesh' },
    'visakhapatnam': { city: 'Visakhapatnam', state: 'Andhra Pradesh' },
    'coimbatore': { city: 'Coimbatore', state: 'Tamil Nadu' },
    'kochi': { city: 'Kochi', state: 'Kerala' },
    'thiruvananthapuram': { city: 'Thiruvananthapuram', state: 'Kerala' },
    'bhubaneswar': { city: 'Bhubaneswar', state: 'Odisha' },
    'guwahati': { city: 'Guwahati', state: 'Assam' },
    'chandigarh': { city: 'Chandigarh', state: 'Chandigarh' },
    'warangal': { city: 'Warangal', state: 'Telangana' },
    'vellore': { city: 'Vellore', state: 'Tamil Nadu' },
    'manipal': { city: 'Manipal', state: 'Karnataka' },
    'roorkee': { city: 'Roorkee', state: 'Uttarakhand' },
    'kharagpur': { city: 'Kharagpur', state: 'West Bengal' },
    'pilani': { city: 'Pilani', state: 'Rajasthan' },
    'ghaziabad': { city: 'Ghaziabad', state: 'Uttar Pradesh' },
    'noida': { city: 'Noida', state: 'Uttar Pradesh' },
    'greater noida': { city: 'Greater Noida', state: 'Uttar Pradesh' }
  };
  
  // Find city in college name
  for (const [key, value] of Object.entries(cityMappings)) {
    if (name.includes(key)) {
      return value;
    }
  }
  
  return location;
};

// Seed colleges function
const seedColleges = async () => {
  try {
    console.log('Starting college seeding process...');
    
    // Clear existing colleges (optional - comment out if you want to keep existing data)
    // await College.deleteMany({});
    // console.log('Cleared existing colleges');
    
    let addedCount = 0;
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const collegeName of indianColleges) {
      try {
        const category = categorizeCollege(collegeName);
        const location = extractLocation(collegeName);
        
        // Use findOrCreate method
        const { college, isNew } = await College.findOrCreate(collegeName);
        
        // Update additional details for new colleges
        if (isNew) {
          college.category = category;
          college.location = location;
          college.isUserAdded = false; // Mark as pre-seeded
          college.isVerified = true;   // Pre-seeded colleges are verified
          await college.save();
          addedCount++;
        } else {
          // Update existing college details if they're empty
          let updated = false;
          if (!college.category || college.category === 'Other') {
            college.category = category;
            updated = true;
          }
          if (!college.location.city && location.city) {
            college.location = location;
            updated = true;
          }
          if (updated) {
            await college.save();
            updatedCount++;
          }
        }
        
        if ((addedCount + updatedCount) % 50 === 0) {
          console.log(`Processed ${addedCount + updatedCount} colleges...`);
        }
        
      } catch (error) {
        console.error(`Error processing college "${collegeName}":`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n=== Seeding Complete ===');
    console.log(`Added: ${addedCount} new colleges`);
    console.log(`Updated: ${updatedCount} existing colleges`);
    console.log(`Errors: ${errorCount} colleges`);
    console.log(`Total processed: ${indianColleges.length} colleges`);
    
    // Get final statistics
    const stats = {
      total: await College.countDocuments(),
      verified: await College.countDocuments({ isVerified: true }),
      userAdded: await College.countDocuments({ isUserAdded: true }),
      categories: await College.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    };
    
    console.log('\n=== Database Statistics ===');
    console.log(`Total colleges in database: ${stats.total}`);
    console.log(`Verified colleges: ${stats.verified}`);
    console.log(`User-added colleges: ${stats.userAdded}`);
    console.log('\nCategories:');
    stats.categories.forEach(cat => {
      console.log(`  ${cat._id}: ${cat.count}`);
    });
    
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
};

// Run the seeding if this file is executed directly
if (require.main === module) {
  connectDB().then(() => {
    seedColleges();
  });
}

module.exports = { seedColleges, connectDB };
