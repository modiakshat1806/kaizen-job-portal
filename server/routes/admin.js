const express = require('express');
const OpenAI = require('openai');
const Job = require('../models/Job');
const Student = require('../models/Student');
const router = express.Router();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// GET /api/admin/jobs - Get all jobs (active and inactive) for admin dashboard
router.get('/jobs', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status, industry, jobType } = req.query;

    // Build filter object
    const filter = {};
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { 'company.name': { $regex: search, $options: 'i' } },
        { jobId: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status === 'active') filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;
    if (industry) filter.industry = industry;
    if (jobType) filter.jobType = jobType;

    // Get jobs with pagination
    const jobs = await Job.find(filter)
      .select('jobId title company jobType location industry salary requirements isActive applicationCount qrCode createdAt updatedAt')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count for pagination
    const totalJobs = await Job.countDocuments(filter);
    const totalPages = Math.ceil(totalJobs / limit);

    // Get summary statistics
    const stats = await Job.aggregate([
      {
        $group: {
          _id: null,
          totalJobs: { $sum: 1 },
          activeJobs: { $sum: { $cond: ['$isActive', 1, 0] } },
          inactiveJobs: { $sum: { $cond: ['$isActive', 0, 1] } },
          totalApplications: { $sum: '$applicationCount' }
        }
      }
    ]);

    res.json({
      message: 'Jobs retrieved successfully',
      jobs,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalJobs,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      stats: stats[0] || {
        totalJobs: 0,
        activeJobs: 0,
        inactiveJobs: 0,
        totalApplications: 0
      }
    });

  } catch (error) {
    console.error('Error fetching jobs for admin:', error);
    res.status(500).json({ 
      error: 'Failed to fetch jobs',
      message: error.message 
    });
  }
});

// DELETE /api/admin/jobs/:id - Delete a job posting
router.delete('/jobs/:id', async (req, res) => {
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

    // Delete the job
    await Job.findByIdAndDelete(job._id);

    res.json({
      message: 'Job deleted successfully',
      deletedJob: {
        id: job._id,
        jobId: job.jobId,
        title: job.title,
        company: job.company.name
      }
    });

  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ 
      error: 'Failed to delete job',
      message: error.message 
    });
  }
});

// PUT /api/admin/jobs/:id/status - Toggle job active status
router.put('/jobs/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

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

    // Update job status
    job.isActive = isActive;
    job.updatedAt = new Date();
    await job.save();

    res.json({
      message: `Job ${isActive ? 'activated' : 'deactivated'} successfully`,
      job: {
        id: job._id,
        jobId: job.jobId,
        title: job.title,
        isActive: job.isActive
      }
    });

  } catch (error) {
    console.error('Error updating job status:', error);
    res.status(500).json({ 
      error: 'Failed to update job status',
      message: error.message 
    });
  }
});

// GET /api/admin/students/search/:phone - Search student by phone number
router.get('/students/search/:phone', async (req, res) => {
  try {
    const { phone } = req.params;

    if (!phone) {
      return res.status(400).json({ 
        error: 'Phone number is required' 
      });
    }

    // Find student by phone number
    const student = await Student.findOne({ phone });

    if (!student) {
      return res.status(404).json({ 
        error: 'Student not found',
        message: `No student found with phone number: ${phone}`
      });
    }

    res.json({
      message: 'Student found successfully',
      student
    });

  } catch (error) {
    console.error('Error searching student:', error);
    res.status(500).json({ 
      error: 'Failed to search student',
      message: error.message 
    });
  }
});

// POST /api/admin/students/:phone/summary - Generate LLM summary for student
router.post('/students/:phone/summary', async (req, res) => {
  try {
    const { phone } = req.params;

    if (!phone) {
      return res.status(400).json({
        error: 'Phone number is required'
      });
    }

    // Find student by phone number
    const student = await Student.findOne({ phone });

    if (!student) {
      return res.status(404).json({
        error: 'Student not found',
        message: `No student found with phone number: ${phone}`
      });
    }

    // Prepare student data for LLM analysis
    const studentData = {
      name: student.name,
      education: student.education,
      skills: student.skills,
      experience: student.experience,
      interests: student.interests,
      careerGoals: student.careerGoals,
      preferredLocation: student.preferredLocation,
      salaryExpectation: student.salaryExpectation,
      assessmentScore: student.assessmentScore
    };

    // Create prompt for LLM summary
    const systemPrompt = `You are an expert HR analyst and career counselor. Your task is to analyze a student's profile and provide a comprehensive, professional summary that would be useful for recruiters and HR professionals.

Please provide a structured analysis that includes:
1. Professional Summary (2-3 sentences overview)
2. Key Strengths (top 3-4 strengths based on skills and assessment)
3. Experience Level (assessment of their experience and readiness)
4. Career Alignment (how well their goals align with their profile)
5. Recommendations (2-3 actionable recommendations for the student)
6. Recruiter Notes (what recruiters should know about this candidate)

Keep the tone professional but engaging, and focus on actionable insights.`;

    const userPrompt = `Please analyze this student profile and provide a comprehensive summary:

Student Profile:
- Name: ${studentData.name}
- Education: ${studentData.education.degree} in ${studentData.education.field} from ${studentData.education.institution} (${studentData.education.graduationYear})
- Skills: ${studentData.skills.map(skill => `${skill.name} (${skill.level})`).join(', ')}
- Experience: ${studentData.experience.years} years
- Internships: ${studentData.experience.internships.map(int => `${int.role} at ${int.company}`).join(', ') || 'None'}
- Projects: ${studentData.experience.projects.map(proj => proj.title).join(', ') || 'None'}
- Interests: ${studentData.interests.join(', ')}
- Career Goals: ${studentData.careerGoals}
- Preferred Locations: ${studentData.preferredLocation.join(', ')}
- Salary Expectation: ${studentData.salaryExpectation.min}-${studentData.salaryExpectation.max} ${studentData.salaryExpectation.currency}
- Assessment Scores: Technical: ${studentData.assessmentScore.technical}%, Communication: ${studentData.assessmentScore.communication}%, Problem Solving: ${studentData.assessmentScore.problemSolving}%, Teamwork: ${studentData.assessmentScore.teamwork}%

Please provide the structured analysis as requested.`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    const summary = completion.choices[0].message.content;

    res.json({
      message: 'Student summary generated successfully',
      student: {
        name: student.name,
        phone: student.phone,
        email: student.email
      },
      summary,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating student summary:', error);
    res.status(500).json({
      error: 'Failed to generate student summary',
      message: error.message
    });
  }
});

// DELETE /api/admin/students/:phone - Delete student profile (role deletion)
router.delete('/students/:phone', async (req, res) => {
  try {
    const { phone } = req.params;

    if (!phone) {
      return res.status(400).json({
        error: 'Phone number is required'
      });
    }

    // Find and delete student by phone number
    const student = await Student.findOneAndDelete({ phone });

    if (!student) {
      return res.status(404).json({
        error: 'Student not found',
        message: `No student found with phone number: ${phone}`
      });
    }

    res.json({
      message: 'Student profile deleted successfully',
      deletedStudent: {
        name: student.name,
        phone: student.phone,
        email: student.email
      }
    });

  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({
      error: 'Failed to delete student profile',
      message: error.message
    });
  }
});

module.exports = router;
