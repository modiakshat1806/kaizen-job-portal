const express = require('express');
const JobApplication = require('../models/JobApplication');
const SavedJob = require('../models/SavedJob');
const Job = require('../models/Job');
const Student = require('../models/Student');
const router = express.Router();

// POST /api/job-application/apply - Apply for a job
router.post('/apply', async (req, res) => {
  try {
    const { studentPhone, jobId, fitmentScore } = req.body;

    if (!studentPhone || !jobId) {
      return res.status(400).json({
        error: 'Student phone and job ID are required'
      });
    }

    // Get student details
    const student = await Student.findOne({ phone: studentPhone });
    if (!student) {
      return res.status(404).json({
        error: 'Student not found. Please complete assessment first.'
      });
    }

    // Get job details
    let job = await Job.findOne({ jobId: jobId });
    if (!job) {
      job = await Job.findById(jobId);
    }
    if (!job) {
      return res.status(404).json({
        error: 'Job not found'
      });
    }

    // Check if already applied
    const existingApplication = await JobApplication.findOne({
      studentPhone: studentPhone,
      jobId: jobId
    });

    if (existingApplication) {
      return res.status(400).json({
        error: 'You have already applied for this job'
      });
    }

    // Create job application
    const application = new JobApplication({
      studentPhone: studentPhone,
      studentName: student.name,
      studentEmail: student.email,
      jobId: jobId,
      jobTitle: job.title,
      companyName: job.company.name,
      fitmentScore: fitmentScore,
      studentDetails: {
        education: student.education,
        skills: student.skills?.map(skill => skill.name) || [],
        experience: student.experience,
        assessmentScore: student.assessmentScore
      }
    });

    await application.save();

    // Update job application count
    await Job.findByIdAndUpdate(job._id, {
      $inc: { applicationCount: 1 }
    });

    res.status(201).json({
      message: 'Application submitted successfully',
      application: {
        id: application._id,
        jobTitle: application.jobTitle,
        companyName: application.companyName,
        appliedAt: application.appliedAt,
        fitmentScore: application.fitmentScore
      }
    });

  } catch (error) {
    console.error('Error applying for job:', error);
    res.status(500).json({
      error: 'Failed to submit application',
      message: error.message
    });
  }
});

// POST /api/job-application/save - Save a job
router.post('/save', async (req, res) => {
  try {
    const { studentPhone, jobId } = req.body;

    if (!studentPhone || !jobId) {
      return res.status(400).json({
        error: 'Student phone and job ID are required'
      });
    }

    // Get job details
    let job = await Job.findOne({ jobId: jobId });
    if (!job) {
      job = await Job.findById(jobId);
    }
    if (!job) {
      return res.status(404).json({
        error: 'Job not found'
      });
    }

    // Check if already saved
    const existingSave = await SavedJob.findOne({
      studentPhone: studentPhone,
      jobId: jobId
    });

    if (existingSave) {
      return res.status(400).json({
        error: 'Job already saved'
      });
    }

    // Create saved job
    const savedJob = new SavedJob({
      studentPhone: studentPhone,
      jobId: jobId,
      jobTitle: job.title,
      companyName: job.company.name,
      jobDetails: {
        description: job.description,
        location: job.location,
        salary: job.salary,
        jobType: job.jobType,
        industry: job.industry,
        requirements: job.requirements
      }
    });

    await savedJob.save();

    res.status(201).json({
      message: 'Job saved successfully',
      savedJob: {
        id: savedJob._id,
        jobTitle: savedJob.jobTitle,
        companyName: savedJob.companyName,
        savedAt: savedJob.savedAt
      }
    });

  } catch (error) {
    console.error('Error saving job:', error);
    res.status(500).json({
      error: 'Failed to save job',
      message: error.message
    });
  }
});

// GET /api/job-application/saved/:phone - Get saved jobs for a student
router.get('/saved/:phone', async (req, res) => {
  try {
    const { phone } = req.params;

    if (!phone) {
      return res.status(400).json({
        error: 'Phone number is required'
      });
    }

    const savedJobs = await SavedJob.find({ studentPhone: phone })
      .sort({ savedAt: -1 });

    res.json({
      message: 'Saved jobs retrieved successfully',
      savedJobs: savedJobs,
      count: savedJobs.length
    });

  } catch (error) {
    console.error('Error fetching saved jobs:', error);
    res.status(500).json({
      error: 'Failed to fetch saved jobs',
      message: error.message
    });
  }
});

// GET /api/job-application/company/:companyName - Get all applications for a company
router.get('/company/:companyName', async (req, res) => {
  try {
    const { companyName } = req.params;

    if (!companyName) {
      return res.status(400).json({
        error: 'Company name is required'
      });
    }

    const applications = await JobApplication.find({ 
      companyName: { $regex: new RegExp(companyName, 'i') }
    })
    .sort({ appliedAt: -1 });

    // Group applications by job
    const applicationsByJob = applications.reduce((acc, app) => {
      if (!acc[app.jobId]) {
        acc[app.jobId] = {
          jobTitle: app.jobTitle,
          jobId: app.jobId,
          applications: []
        };
      }
      acc[app.jobId].applications.push(app);
      return acc;
    }, {});

    res.json({
      message: 'Company applications retrieved successfully',
      companyName: companyName,
      totalApplications: applications.length,
      applicationsByJob: Object.values(applicationsByJob),
      allApplications: applications
    });

  } catch (error) {
    console.error('Error fetching company applications:', error);
    res.status(500).json({
      error: 'Failed to fetch company applications',
      message: error.message
    });
  }
});

// DELETE /api/job-application/saved/:phone/:jobId - Remove saved job
router.delete('/saved/:phone/:jobId', async (req, res) => {
  try {
    const { phone, jobId } = req.params;

    const deletedJob = await SavedJob.findOneAndDelete({
      studentPhone: phone,
      jobId: jobId
    });

    if (!deletedJob) {
      return res.status(404).json({
        error: 'Saved job not found'
      });
    }

    res.json({
      message: 'Job removed from saved list',
      deletedJob: {
        jobTitle: deletedJob.jobTitle,
        companyName: deletedJob.companyName
      }
    });

  } catch (error) {
    console.error('Error removing saved job:', error);
    res.status(500).json({
      error: 'Failed to remove saved job',
      message: error.message
    });
  }
});

module.exports = router;
