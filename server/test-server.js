const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// Test MongoDB connection
app.get('/test-db', async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    res.json({ 
      message: 'Database connection test',
      state: states[dbState],
      mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/kaizen-job-portal'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test student creation
app.post('/test-student', async (req, res) => {
  try {
    const testData = {
      name: 'Test Student',
      phone: '1234567890',
      email: 'test@example.com',
      education: {
        degree: 'BTech',
        field: 'Computer Science',
        institution: 'Test University',
        graduationYear: 2024
      },
      careerGoals: 'Software Development'
    };
    
    res.json({ 
      message: 'Test student data prepared',
      data: testData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kaizen-job-portal', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  app.listen(PORT, 'localhost', () => {
    console.log(`✅ Test server running on http://localhost:${PORT}`);
    console.log(`✅ Test endpoints:`);
    console.log(`   - http://localhost:${PORT}/test`);
    console.log(`   - http://localhost:${PORT}/test-db`);
    console.log(`   - http://localhost:${PORT}/test-student`);
  });
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  console.log('🔧 Please make sure MongoDB is running on your system');
  process.exit(1);
});
