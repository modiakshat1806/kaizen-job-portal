const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const College = require('../models/College');

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

// Function to clean and normalize college names
const cleanCollegeName = (name) => {
  if (!name) return '';
  
  return name
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/[^\w\s\-\(\),\.&]/g, '') // Remove special characters except common ones
    .replace(/\b(college|university|institute|academy|school)\b/gi, (match) => {
      // Capitalize common institution words
      return match.charAt(0).toUpperCase() + match.slice(1).toLowerCase();
    });
};

// Function to extract state from various possible columns
const extractState = (row) => {
  // Common column names for state
  const stateColumns = ['state', 'State', 'STATE', 'state_name', 'State_Name'];
  
  for (const col of stateColumns) {
    if (row[col] && row[col].trim()) {
      return row[col].trim();
    }
  }
  
  return '';
};

// Function to extract city from various possible columns
const extractCity = (row) => {
  // Common column names for city
  const cityColumns = ['city', 'City', 'CITY', 'district', 'District', 'location', 'Location'];
  
  for (const col of cityColumns) {
    if (row[col] && row[col].trim()) {
      return row[col].trim();
    }
  }
  
  return '';
};

// Function to determine college category
const determineCategory = (row) => {
  const name = (row.college_name || row.College_Name || row.name || '').toLowerCase();
  const type = (row.type || row.Type || row.category || '').toLowerCase();
  
  if (name.includes('medical') || type.includes('medical')) return 'Medical';
  if (name.includes('management') || name.includes('business') || type.includes('management')) return 'Management';
  if (name.includes('law') || type.includes('law')) return 'Law';
  if (name.includes('arts') || name.includes('commerce') || type.includes('arts')) return 'Arts & Science';
  
  // Default to Engineering for engineering colleges dataset
  return 'Engineering';
};

// Function to extract college name from various possible columns
const extractCollegeName = (row) => {
  // Common column names for college name
  const nameColumns = [
    'college_name', 'College_Name', 'name', 'Name', 'NAME',
    'institution_name', 'Institution_Name', 'college', 'College'
  ];
  
  for (const col of nameColumns) {
    if (row[col] && row[col].trim()) {
      return cleanCollegeName(row[col]);
    }
  }
  
  return '';
};

// Main import function
const importCSVColleges = async (csvFilePath) => {
  return new Promise((resolve, reject) => {
    const colleges = [];
    const errors = [];
    let rowCount = 0;
    
    console.log(`Starting CSV import from: ${csvFilePath}`);
    
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        rowCount++;
        
        try {
          const collegeName = extractCollegeName(row);
          
          if (!collegeName || collegeName.length < 3) {
            errors.push(`Row ${rowCount}: Invalid or missing college name`);
            return;
          }
          
          const collegeData = {
            name: collegeName,
            category: determineCategory(row),
            location: {
              city: extractCity(row),
              state: extractState(row),
              country: 'India'
            },
            isUserAdded: false,
            isVerified: true, // CSV data is considered verified
            usageCount: 1,
            rawData: row // Store original row for debugging
          };
          
          colleges.push(collegeData);
          
        } catch (error) {
          errors.push(`Row ${rowCount}: ${error.message}`);
        }
      })
      .on('end', () => {
        console.log(`\nCSV parsing complete:`);
        console.log(`Total rows processed: ${rowCount}`);
        console.log(`Valid colleges found: ${colleges.length}`);
        console.log(`Errors: ${errors.length}`);
        
        if (errors.length > 0) {
          console.log('\nFirst 10 errors:');
          errors.slice(0, 10).forEach(error => console.log(`  ${error}`));
        }
        
        resolve({ colleges, errors, rowCount });
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

// Function to save colleges to database
const saveCollegesToDB = async (colleges) => {
  let addedCount = 0;
  let updatedCount = 0;
  let errorCount = 0;
  
  console.log('\nSaving colleges to database...');
  
  for (let i = 0; i < colleges.length; i++) {
    try {
      const collegeData = colleges[i];
      
      // Use findOrCreate method
      const { college, isNew } = await College.findOrCreate(collegeData.name);
      
      if (isNew) {
        // Set additional properties for new college
        college.category = collegeData.category;
        college.location = collegeData.location;
        college.isUserAdded = collegeData.isUserAdded;
        college.isVerified = collegeData.isVerified;
        await college.save();
        addedCount++;
      } else {
        // Update existing college if it has less information
        let updated = false;
        
        if (!college.location.state && collegeData.location.state) {
          college.location.state = collegeData.location.state;
          updated = true;
        }
        
        if (!college.location.city && collegeData.location.city) {
          college.location.city = collegeData.location.city;
          updated = true;
        }
        
        if (college.category === 'Other' && collegeData.category !== 'Other') {
          college.category = collegeData.category;
          updated = true;
        }
        
        if (updated) {
          await college.save();
          updatedCount++;
        }
      }
      
      // Progress indicator
      if ((i + 1) % 100 === 0) {
        console.log(`Processed ${i + 1}/${colleges.length} colleges...`);
      }
      
    } catch (error) {
      console.error(`Error saving college "${colleges[i].name}":`, error.message);
      errorCount++;
    }
  }
  
  return { addedCount, updatedCount, errorCount };
};

// Main execution function
const main = async () => {
  try {
    // Check if CSV file path is provided
    const csvFilePath = process.argv[2] || path.join(__dirname, '../../data/Indian_Engineering_Colleges_Dataset.csv');
    
    if (!fs.existsSync(csvFilePath)) {
      console.error(`CSV file not found: ${csvFilePath}`);
      console.log('\nUsage: node importCSVColleges.js [path-to-csv-file]');
      console.log('Or place the CSV file at: data/Indian_Engineering_Colleges_Dataset.csv');
      process.exit(1);
    }
    
    // Connect to database
    await connectDB();
    
    // Import CSV data
    const { colleges, errors, rowCount } = await importCSVColleges(csvFilePath);
    
    if (colleges.length === 0) {
      console.log('No valid colleges found in CSV file');
      process.exit(1);
    }
    
    // Show sample data
    console.log('\nSample college data:');
    colleges.slice(0, 3).forEach((college, index) => {
      console.log(`${index + 1}. ${college.name}`);
      console.log(`   Category: ${college.category}`);
      console.log(`   Location: ${college.location.city}, ${college.location.state}`);
    });
    
    // Ask for confirmation (in production, you might want to add readline for interactive confirmation)
    console.log(`\nReady to import ${colleges.length} colleges to database.`);
    
    // Save to database
    const { addedCount, updatedCount, errorCount } = await saveCollegesToDB(colleges);
    
    // Final statistics
    console.log('\n=== Import Complete ===');
    console.log(`CSV rows processed: ${rowCount}`);
    console.log(`Valid colleges parsed: ${colleges.length}`);
    console.log(`New colleges added: ${addedCount}`);
    console.log(`Existing colleges updated: ${updatedCount}`);
    console.log(`Errors during save: ${errorCount}`);
    
    // Get final database stats
    const totalColleges = await College.countDocuments();
    const engineeringColleges = await College.countDocuments({ category: 'Engineering' });
    
    console.log(`\nTotal colleges in database: ${totalColleges}`);
    console.log(`Engineering colleges: ${engineeringColleges}`);
    
  } catch (error) {
    console.error('Error during import:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
};

// Run if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = { importCSVColleges, saveCollegesToDB, connectDB };
