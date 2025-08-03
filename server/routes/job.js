const express = require('express');
const { body, validationResult } = require('express-validator');
const QRCode = require('qrcode');
const Job = require('../models/Job');
const router = express.Router();

// Validation middleware
const validateJobData = [
  body('title').trim().isLength({ min: 3 }).withMessage('Job title must be at least 3 characters'),
  body('company.name').trim().isLength({ min: 2 }).withMessage('Company name must be at least 2 characters'),
  body('description').isLength({ min: 10 }).withMessage('Job description must be at least 10 characters'),
  body('requirements.education').isIn(['High School', 'Bachelor', 'Master', 'PhD', 'Diploma', 'Any']).withMessage('Invalid education requirement'),
  body('jobType').isIn(['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance']).withMessage('Invalid job type'),
  body('industry').notEmpty().withMessage('Industry is required'),
  body('location.type').isIn(['Remote', 'On-site', 'Hybrid']).withMessage('Invalid location type'),
  body('contactPerson.name').trim().isLength({ min: 2 }).withMessage('Contact person name must be at least 2 characters'),
  body('contactPerson.phone').trim().isLength({ min: 10 }).withMessage('Contact person phone must be at least 10 characters')
];

// POST /api/job - Create new job posting
router.post('/', validateJobData, async (req, res) => {
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
      title,
      company,
      contactPerson,
      description,
      requirements,
      responsibilities,
      benefits,
      location,
      salary,
      jobType,
      industry,
      department,
      applicationDeadline
    } = req.body;

    // Create new job
    const job = new Job({
      title,
      company,
      contactPerson,
      description,
      requirements: requirements || { education: 'Any', experience: { min: 0 }, skills: [], certifications: [] },
      responsibilities: responsibilities || [],
      benefits: benefits || [],
      location: location || { type: 'On-site' },
      salary: salary || { min: 0, max: 0, currency: 'INR', period: 'Yearly' },
      jobType,
      industry,
      department,
      applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null
    });

    await job.save();

    // Generate QR code for the job
    const jobUrl = job.generateQRCode();
    const qrCodeDataUrl = await QRCode.toDataURL(jobUrl);

    // Update job with QR code
    job.qrCode = qrCodeDataUrl;
    await job.save();

    res.status(201).json({
      message: 'Job posting created successfully',
      job: {
        id: job._id,
        jobId: job.jobId,
        title: job.title,
        company: job.company,
        jobType: job.jobType,
        location: job.location,
        qrCode: job.qrCode,
        jobUrl: jobUrl
      }
    });

  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ 
      error: 'Failed to create job posting',
      message: error.message 
    });
  }
});

// GET /api/job/:id - Get job by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Try to find by jobId first, then by _id
    let job = await Job.findOne({ jobId: id });
    if (!job) {
      job = await Job.findById(id);
    }

    if (!job) {
      return res.status(404).json({ 
        error: 'Job not found' 
      });
    }

    // Generate QR code if not exists
    if (!job.qrCode) {
      const jobUrl = job.generateQRCode();
      job.qrCode = await QRCode.toDataURL(jobUrl);
      await job.save();
    }

    res.json({
      message: 'Job found successfully',
      job
    });

  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ 
      error: 'Failed to fetch job data',
      message: error.message 
    });
  }
});

// GET /api/job - Get all active jobs
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, industry, jobType, location } = req.query;

    const filter = { isActive: true };
    
    if (industry) filter.industry = industry;
    if (jobType) filter.jobType = jobType;
    if (location) filter['location.type'] = location;

    const jobs = await Job.find(filter)
      .select('jobId title company jobType location industry salary requirements createdAt')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Job.countDocuments(filter);

    res.json({
      message: 'Jobs retrieved successfully',
      jobs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalJobs: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ 
      error: 'Failed to fetch jobs',
      message: error.message 
    });
  }
});

// PUT /api/job/:id - Update job posting
router.put('/:id', validateJobData, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    // Try to find by jobId first, then by _id
    let job = await Job.findOne({ jobId: id });
    if (!job) {
      job = await Job.findById(id);
    }

    if (!job) {
      return res.status(404).json({ 
        error: 'Job not found' 
      });
    }

    // Update job
    const updatedJob = await Job.findByIdAndUpdate(
      job._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Job updated successfully',
      job: updatedJob
    });

  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ 
      error: 'Failed to update job',
      message: error.message 
    });
  }
});

module.exports = router; 