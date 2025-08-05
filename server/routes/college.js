const express = require('express');
const { body, validationResult } = require('express-validator');
const College = require('../models/College');
const router = express.Router();

// Validation middleware for college data
const validateCollegeData = [
  body('name').trim().isLength({ min: 3 }).withMessage('College name must be at least 3 characters'),
  body('addedBy').optional().isLength({ min: 10 }).withMessage('Invalid phone number')
];

// GET /api/college/search - Search colleges
router.get('/search', async (req, res) => {
  try {
    const { q: query, limit = 10 } = req.query;
    
    const colleges = await College.searchColleges(query, parseInt(limit));
    
    res.json({
      success: true,
      colleges: colleges.map(college => ({
        name: college.name,
        category: college.category,
        location: college.location,
        usageCount: college.usageCount,
        isVerified: college.isVerified
      })),
      total: colleges.length
    });
    
  } catch (error) {
    console.error('Error searching colleges:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search colleges',
      message: error.message
    });
  }
});

// GET /api/college/popular - Get popular colleges
router.get('/popular', async (req, res) => {
  try {
    const { limit = 15 } = req.query;
    
    const colleges = await College.getPopularColleges(parseInt(limit));
    
    res.json({
      success: true,
      colleges: colleges.map(college => ({
        name: college.name,
        category: college.category,
        location: college.location,
        usageCount: college.usageCount
      })),
      total: colleges.length
    });
    
  } catch (error) {
    console.error('Error fetching popular colleges:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch popular colleges',
      message: error.message
    });
  }
});

// GET /api/college/region/:region - Get colleges by region
router.get('/region/:region', async (req, res) => {
  try {
    const { region } = req.params;
    const { limit = 20 } = req.query;
    
    const colleges = await College.getCollegesByRegion(region, parseInt(limit));
    
    res.json({
      success: true,
      colleges: colleges.map(college => ({
        name: college.name,
        category: college.category,
        location: college.location,
        usageCount: college.usageCount
      })),
      total: colleges.length,
      region
    });
    
  } catch (error) {
    console.error('Error fetching colleges by region:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch colleges by region',
      message: error.message
    });
  }
});

// POST /api/college/add - Add new college
router.post('/add', validateCollegeData, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }
    
    const { name, addedBy, category, location } = req.body;
    
    // Use findOrCreate to handle duplicates
    const { college, isNew } = await College.findOrCreate(name, addedBy);
    
    // Update additional details if provided
    if (isNew && (category || location)) {
      if (category) college.category = category;
      if (location) college.location = location;
      await college.save();
    }
    
    res.status(isNew ? 201 : 200).json({
      success: true,
      message: isNew ? 'New college added successfully' : 'College already exists, usage count updated',
      college: {
        name: college.name,
        category: college.category,
        location: college.location,
        usageCount: college.usageCount,
        isNew
      }
    });
    
  } catch (error) {
    console.error('Error adding college:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add college',
      message: error.message
    });
  }
});

// POST /api/college/bulk-add - Bulk add colleges (for initial seeding)
router.post('/bulk-add', async (req, res) => {
  try {
    const { colleges } = req.body;
    
    if (!Array.isArray(colleges) || colleges.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Colleges array is required'
      });
    }
    
    const results = {
      added: 0,
      updated: 0,
      errors: []
    };
    
    for (const collegeName of colleges) {
      try {
        const { college, isNew } = await College.findOrCreate(collegeName);
        if (isNew) {
          results.added++;
        } else {
          results.updated++;
        }
      } catch (error) {
        results.errors.push({
          college: collegeName,
          error: error.message
        });
      }
    }
    
    res.json({
      success: true,
      message: 'Bulk operation completed',
      results
    });
    
  } catch (error) {
    console.error('Error in bulk add:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to bulk add colleges',
      message: error.message
    });
  }
});

// GET /api/college/stats - Get database statistics
router.get('/stats', async (req, res) => {
  try {
    const totalColleges = await College.countDocuments();
    const verifiedColleges = await College.countDocuments({ isVerified: true });
    const userAddedColleges = await College.countDocuments({ isUserAdded: true });
    const popularColleges = await College.countDocuments({ usageCount: { $gte: 5 } });
    
    // Get top categories
    const categoryStats = await College.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Get top locations
    const locationStats = await College.aggregate([
      { $group: { _id: '$location.state', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    res.json({
      success: true,
      stats: {
        total: totalColleges,
        verified: verifiedColleges,
        userAdded: userAddedColleges,
        popular: popularColleges,
        categories: categoryStats,
        topStates: locationStats
      }
    });
    
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics',
      message: error.message
    });
  }
});

// PUT /api/college/:id/verify - Verify a college (admin only)
router.put('/:id/verify', async (req, res) => {
  try {
    const { id } = req.params;
    const { verified = true } = req.body;
    
    const college = await College.findByIdAndUpdate(
      id,
      { isVerified: verified },
      { new: true }
    );
    
    if (!college) {
      return res.status(404).json({
        success: false,
        error: 'College not found'
      });
    }
    
    res.json({
      success: true,
      message: `College ${verified ? 'verified' : 'unverified'} successfully`,
      college: {
        name: college.name,
        isVerified: college.isVerified
      }
    });
    
  } catch (error) {
    console.error('Error verifying college:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify college',
      message: error.message
    });
  }
});

module.exports = router;
