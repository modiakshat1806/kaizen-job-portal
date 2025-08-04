const express = require('express');
const { body, validationResult } = require('express-validator');
const Student = require('../models/Student');
const router = express.Router();

// Validation middleware
const validateStudentData = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('phone').isMobilePhone().withMessage('Please provide a valid phone number'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('education.degree').isIn(['BE', 'BTech', 'MSc', 'MTech', 'MBA', 'BBA', 'BCom', 'BCA', 'MCA']).withMessage('Invalid degree'),
  body('education.field').notEmpty().withMessage('Field of study is required'),
  body('education.institution').notEmpty().withMessage('Institution is required'),
  body('education.graduationYear').isInt({ min: 1950, max: new Date().getFullYear() + 10 }).withMessage('Invalid graduation year'),
  body('careerGoals').notEmpty().withMessage('Career goals are required'),
  body('experienceYears').optional().isInt({ min: 0, max: 50 }).withMessage('Experience years must be between 0 and 50')
];

// POST /api/student - Save student assessment
router.post('/', validateStudentData, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const {
      name,
      phone,
      email,
      education,
      skills,
      experience,
      experienceYears,
      interests,
      careerGoals,
      preferredLocation,
      salaryExpectation,
      assessmentScore
    } = req.body;

    // Check if student already exists
    const existingStudent = await Student.findOne({ phone });
    if (existingStudent) {
      return res.status(400).json({ 
        error: 'Student with this phone number already exists' 
      });
    }

    // Create new student
    const student = new Student({
      name,
      phone,
      email,
      education,
      skills: skills || [],
      experience: {
        years: experience?.years || experienceYears || 0,
        internships: experience?.internships || [],
        projects: experience?.projects || []
      },
      interests: interests || [],
      careerGoals,
      preferredLocation: preferredLocation || [],
      salaryExpectation: salaryExpectation || { min: 0, max: 0, currency: 'USD' },
      assessmentScore: assessmentScore || {
        technical: 0,
        communication: 0,
        problemSolving: 0,
        teamwork: 0
      }
    });

    await student.save();

    res.status(201).json({
      message: 'Student assessment saved successfully',
      student: {
        id: student._id,
        name: student.name,
        phone: student.phone,
        email: student.email,
        assessmentScore: student.assessmentScore
      }
    });

  } catch (error) {
    console.error('Error saving student:', error);
    res.status(500).json({ 
      error: 'Failed to save student assessment',
      message: error.message 
    });
  }
});

// GET /api/student/:phone - Get student by phone
router.get('/:phone', async (req, res) => {
  try {
    const { phone } = req.params;

    const student = await Student.findOne({ phone });
    
    if (!student) {
      return res.status(404).json({ 
        error: 'Student not found' 
      });
    }

    res.json({
      message: 'Student found successfully',
      student
    });

  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ 
      error: 'Failed to fetch student data',
      message: error.message 
    });
  }
});

// PUT /api/student/:phone - Update student assessment
router.put('/:phone', validateStudentData, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { phone } = req.params;
    const updateData = req.body;

    const student = await Student.findOneAndUpdate(
      { phone },
      updateData,
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({ 
        error: 'Student not found' 
      });
    }

    res.json({
      message: 'Student assessment updated successfully',
      student
    });

  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ 
      error: 'Failed to update student assessment',
      message: error.message 
    });
  }
});

module.exports = router; 