const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const studentRoutes = require('./routes/student');
const jobRoutes = require('./routes/job');
const fitmentRoutes = require('./routes/fitment');
const openaiRoutes = require('./routes/openai');
const recommendationsRoutes = require('./routes/recommendations');
const adminRoutes = require('./routes/admin');
const voiceRoutes = require('./routes/voice');
const jobApplicationRoutes = require('./routes/jobApplication');
const collegeRoutes = require('./routes/college');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kaizen-job-portal', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/student', studentRoutes);
app.use('/api/job', jobRoutes);
app.use('/api/fitment', fitmentRoutes);
app.use('/api', openaiRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/job-application', jobApplicationRoutes);
app.use('/api/college', collegeRoutes);

// Health check endpoints
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Kaizen Job Portal API is running on Railway' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Kaizen Job Portal API is running on Railway' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server for Railway deployment
if (process.env.RAILWAY_ENVIRONMENT || process.env.NODE_ENV === 'production') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
  });
} else {
  // For local development
  app.listen(PORT, 'localhost', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

module.exports = app;