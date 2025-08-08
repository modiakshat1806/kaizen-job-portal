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

    // Get summary statistics - calculate from all jobs, not filtered
    const allJobsStats = await Job.aggregate([
      {
        $group: {
          _id: null,
          totalJobs: { $sum: 1 },
          activeJobs: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } },
          inactiveJobs: { $sum: { $cond: [{ $eq: ['$isActive', false] }, 1, 0] } },
          totalApplications: { $sum: { $ifNull: ['$applicationCount', 0] } }
        }
      }
    ]);

    // If no jobs exist, provide default stats
    const stats = allJobsStats.length > 0 ? allJobsStats[0] : {
      totalJobs: 0,
      activeJobs: 0,
      inactiveJobs: 0,
      totalApplications: 0
    };



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
      stats: stats
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
    console.log('Generating summary for phone:', phone);

    if (!phone) {
      console.log('Error: No phone number provided');
      return res.status(400).json({
        error: 'Phone number is required'
      });
    }

    // Find student by phone number
    const student = await Student.findOne({ phone });
    console.log('Student found:', student ? 'Yes' : 'No');

    if (!student) {
      console.log('Student not found for phone:', phone);
      return res.status(404).json({
        error: 'Student not found',
        message: `No student found with phone number: ${phone}`
      });
    }

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not found');
      return res.status(500).json({
        error: 'OpenAI API key not configured',
        message: 'Server configuration error'
      });
    }

    // Create comprehensive prompt for student analysis
    const systemPrompt = `You are an expert HR analyst and career counselor. Analyze the student's profile and provide a comprehensive behavioral and skills assessment that would be valuable for recruiters and career guidance.

Focus on:
1. Core Behavioral Traits (based on assessment scores and profile)
2. Technical Competencies (strengths and areas for development)
3. Communication & Interpersonal Skills
4. Problem-Solving Approach
5. Teamwork & Collaboration Style
6. Career Readiness & Potential
7. Recommended Career Paths
8. Development Suggestions

Provide actionable insights without any fitment scores. Focus on the student's inherent capabilities, work style, and potential.`;

    // Build dynamic user prompt based on available data
    let userPrompt = `Analyze this student profile and provide a comprehensive behavioral and skills assessment:

STUDENT PROFILE:
- Name: ${student.name}
- Education: ${student.education?.degree || 'Not specified'} in ${student.education?.field || 'Not specified'} from ${student.education?.institution || 'Not specified'} (Graduating: ${student.education?.graduationYear || 'Not specified'})
- Experience: ${student.experienceYears || student.experience?.years || 0} years
- Career Goals: ${student.careerGoals || 'Not specified'}

ASSESSMENT SCORES (Key Behavioral Indicators):
- Technical Skills: ${student.assessmentScore?.technical || 0}/100
- Communication Skills: ${student.assessmentScore?.communication || 0}/100
- Problem-Solving Ability: ${student.assessmentScore?.problemSolving || 0}/100
- Teamwork & Collaboration: ${student.assessmentScore?.teamwork || 0}/100`;

    // Add core values if available
    if (student.coreValues && student.coreValues.length > 0) {
      userPrompt += `\n- Core Values: ${student.coreValues.join(', ')}`;
    }

    // Add work preferences if available
    if (student.workPreferences) {
      userPrompt += `\n\nWORK STYLE PREFERENCES:`;
      if (student.workPreferences.independence !== undefined) {
        userPrompt += `\n- Independence Level: ${student.workPreferences.independence}/100`;
      }
      if (student.workPreferences.routine !== undefined) {
        userPrompt += `\n- Routine Preference: ${student.workPreferences.routine}/100`;
      }
      if (student.workPreferences.pace !== undefined) {
        userPrompt += `\n- Work Pace: ${student.workPreferences.pace}/100`;
      }
      if (student.workPreferences.focus !== undefined) {
        userPrompt += `\n- Focus Style: ${student.workPreferences.focus}/100`;
      }
      if (student.workPreferences.approach !== undefined) {
        userPrompt += `\n- Collaborative Approach: ${student.workPreferences.approach}/100`;
      }
    }

    // Add additional fields if they exist
    if (student.skills && student.skills.length > 0) {
      userPrompt += `\n\nTECHNICAL SKILLS: ${student.skills.map(skill => `${skill.name} (${skill.level})`).join(', ')}`;
    }

    if (student.interests && student.interests.length > 0) {
      userPrompt += `\n\nINTERESTS: ${student.interests.join(', ')}`;
    }

    if (student.experience?.projects && student.experience.projects.length > 0) {
      userPrompt += `\n\nPROJECTS: ${student.experience.projects.map(proj => proj.title).join(', ')}`;
    }

    if (student.experience?.internships && student.experience.internships.length > 0) {
      userPrompt += `\n\nINTERNSHIPS: ${student.experience.internships.map(int => `${int.role} at ${int.company}`).join(', ')}`;
    }

    userPrompt += `\n\nPlease provide a detailed behavioral and skills analysis focusing on the student's core competencies, work style, and career potential. Structure your response with clear sections and actionable insights.`;

    console.log('Calling OpenAI API for student summary...');
    console.log('User prompt length:', userPrompt.length);

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

    console.log('OpenAI API call successful');
    const summary = completion.choices[0].message.content;
    console.log('Summary generated, length:', summary.length);

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

    // Handle specific OpenAI errors
    if (error.code === 'insufficient_quota') {
      return res.status(500).json({
        error: 'OpenAI quota exceeded',
        message: 'AI service temporarily unavailable. Please try again later.'
      });
    }

    if (error.code === 'invalid_api_key') {
      return res.status(500).json({
        error: 'OpenAI API key invalid',
        message: 'Server configuration error. Please contact administrator.'
      });
    }

    // Handle network/timeout errors
    if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
      return res.status(500).json({
        error: 'Network timeout',
        message: 'Request timed out. Please try again.'
      });
    }

    res.status(500).json({
      error: 'Failed to generate student summary',
      message: error.message || 'Unknown error occurred',
      code: error.code || 'UNKNOWN_ERROR'
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
