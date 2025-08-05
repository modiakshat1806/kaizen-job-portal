// Test script to verify voice functionality
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Voice test server is working!' });
});

// Test OpenAI connection
app.get('/test-openai', (req, res) => {
  try {
    const OpenAI = require('openai');
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'test-key'
    });
    
    res.json({ 
      message: 'OpenAI client initialized successfully',
      hasApiKey: !!process.env.OPENAI_API_KEY
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'OpenAI initialization failed',
      message: error.message 
    });
  }
});

const PORT = 5001;
app.listen(PORT, 'localhost', () => {
  console.log(`✅ Voice test server running on http://localhost:${PORT}`);
  console.log(`✅ Test endpoints:`);
  console.log(`   - http://localhost:${PORT}/test`);
  console.log(`   - http://localhost:${PORT}/test-openai`);
});
