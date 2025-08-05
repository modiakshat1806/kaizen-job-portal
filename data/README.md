# Data Directory

This directory contains datasets for the Kaizen Job Portal college database.

## CSV Dataset Integration

### Setup Instructions

1. **Copy your CSV file** to this directory:
   ```
   kaizen-job-portal/data/Indian_Engineering_Colleges_Dataset.csv
   ```

2. **Install dependencies** (if not already installed):
   ```bash
   cd server
   npm install csv-parser
   ```

3. **Import the CSV data**:
   ```bash
   cd server
   npm run import-csv
   ```

   Or specify a custom path:
   ```bash
   node scripts/importCSVColleges.js "C:\Users\PRAGYA\Downloads\Indian_Engineering_Colleges_Dataset.csv"
   ```

### Expected CSV Format

The import script is flexible and can handle various column names. It looks for:

#### College Name Columns (any of these):
- `college_name`
- `College_Name` 
- `name`
- `Name`
- `institution_name`
- `college`

#### Location Columns (any of these):
- **State**: `state`, `State`, `state_name`
- **City**: `city`, `City`, `district`, `location`

#### Category/Type Columns (any of these):
- `type`
- `Type`
- `category`

### Sample CSV Structure

```csv
college_name,state,city,type
"Indian Institute of Technology, Delhi",Delhi,Delhi,Engineering
"All India Institute of Medical Sciences",Delhi,Delhi,Medical
"Indian Institute of Management, Ahmedabad",Gujarat,Ahmedabad,Management
```

### Features

✅ **Automatic Data Cleaning** - Removes special characters, normalizes spacing
✅ **Smart Categorization** - Auto-categorizes as Engineering, Medical, Management, etc.
✅ **Location Extraction** - Extracts city and state information
✅ **Duplicate Handling** - Uses existing colleges, updates missing information
✅ **Error Reporting** - Detailed logs of any import issues
✅ **Progress Tracking** - Shows import progress for large datasets

### Import Process

1. **Parse CSV** - Reads and validates each row
2. **Clean Data** - Normalizes college names and locations
3. **Categorize** - Automatically determines college category
4. **Save to Database** - Uses MongoDB with duplicate detection
5. **Update Statistics** - Refreshes database statistics

### Expected Output

```
Starting CSV import from: data/Indian_Engineering_Colleges_Dataset.csv

CSV parsing complete:
Total rows processed: 3500
Valid colleges found: 3450
Errors: 50

Sample college data:
1. Indian Institute of Technology, Delhi
   Category: Engineering
   Location: Delhi, Delhi

2. All India Institute of Medical Sciences, New Delhi
   Category: Medical
   Location: Delhi, Delhi

Saving colleges to database...
Processed 100/3450 colleges...
Processed 200/3450 colleges...
...

=== Import Complete ===
CSV rows processed: 3500
Valid colleges parsed: 3450
New colleges added: 2800
Existing colleges updated: 650
Errors during save: 0

Total colleges in database: 3950
Engineering colleges: 2800
```

### Troubleshooting

#### Common Issues:

1. **File Not Found**
   ```
   Error: CSV file not found: data/Indian_Engineering_Colleges_Dataset.csv
   ```
   **Solution**: Copy the CSV file to the correct location

2. **No Valid Colleges Found**
   ```
   No valid colleges found in CSV file
   ```
   **Solution**: Check CSV column names match expected format

3. **Database Connection Error**
   ```
   MongoDB connection error
   ```
   **Solution**: Ensure MongoDB is running and connection string is correct

#### Column Name Mapping

If your CSV has different column names, you can modify the script:

```javascript
// In importCSVColleges.js, update these arrays:
const nameColumns = ['your_college_column', 'college_name'];
const stateColumns = ['your_state_column', 'state'];
const cityColumns = ['your_city_column', 'city'];
```

### Post-Import Verification

After importing, verify the data:

1. **Check Database Statistics**:
   ```bash
   # Visit the demo page
   http://localhost:3003/autocomplete-demo
   ```

2. **Test Search Functionality**:
   - Search for colleges from your dataset
   - Verify location and category information
   - Check autocomplete suggestions

3. **API Verification**:
   ```bash
   curl "http://localhost:5000/api/college/stats"
   curl "http://localhost:5000/api/college/search?q=IIT"
   ```

### Data Quality

The import script includes several data quality features:

- **Name Normalization**: Standardizes college names
- **Location Validation**: Ensures city/state consistency  
- **Category Assignment**: Smart categorization based on name patterns
- **Duplicate Prevention**: Avoids creating duplicate entries
- **Error Logging**: Tracks and reports data issues

### Integration with Autocomplete

Once imported, the CSV data will:

✅ **Appear in Search Results** - All colleges searchable via autocomplete
✅ **Regional Filtering** - Hyderabad colleges prioritized for fest
✅ **Category Filtering** - Engineering colleges properly categorized
✅ **Usage Tracking** - Popular colleges appear first in suggestions
✅ **Real-time Updates** - Statistics update immediately

### Performance Considerations

- **Large Datasets**: Script handles thousands of records efficiently
- **Memory Usage**: Processes data in batches to manage memory
- **Database Indexing**: Automatic indexing for fast search
- **Caching**: Results cached for improved performance

The CSV import significantly enhances the college database with comprehensive, real-world data! 🚀
