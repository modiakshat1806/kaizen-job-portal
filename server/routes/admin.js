const express = require('express');
const OpenAI = require('openai');
const Job = require('../models/Job');
const Student = require('../models/Student');
const router = express.Router();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Helper function to remove duplicate sections from LLM response
function removeDuplicateSections(text) {
  const problematicSections = [
    'Technical Competencies',
    'Problem-Solving Approach',
    'Teamwork & Collaboration',
    'Communication Style',
    'Career Readiness',
    'Development Recommendations'
  ];

  let cleanedText = text;

  // For each problematic section, keep only the first occurrence
  problematicSections.forEach(section => {
    const regex = new RegExp(`\\*\\*${section}\\*\\*`, 'gi');
    const matches = [...cleanedText.matchAll(regex)];

    if (matches.length > 1) {
      // Find the second occurrence and everything until the next section or end
      const secondMatch = matches[1];
      const startIndex = secondMatch.index;

      // Find the next section heading or end of text
      const nextSectionRegex = /\*\*[^*]+\*\*/g;
      nextSectionRegex.lastIndex = startIndex + section.length + 4; // Skip current heading
      const nextMatch = nextSectionRegex.exec(cleanedText);

      const endIndex = nextMatch ? nextMatch.index : cleanedText.length;

      // Remove the duplicate section
      cleanedText = cleanedText.slice(0, startIndex) + cleanedText.slice(endIndex);
    }
  });

  return cleanedText.trim();
}

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
    const systemPrompt = `You are an expert HR analyst. Provide a single, comprehensive analysis with NO REPEATED SECTIONS.

CRITICAL RULES:
- Each section heading must appear EXACTLY ONCE
- Never repeat "Technical Competencies", "Problem-Solving Approach", or "Teamwork & Collaboration"
- If you mention a topic, do not create another section for it
- Combine related information under one heading only

STRUCTURE (use these exact headings, each appearing only once):

**Core Behavioral Profile**
[Personality traits, work style, and behavioral patterns]

**Technical & Problem-Solving Competencies**
[Technical skills AND problem-solving abilities combined in one section]

**Communication & Collaboration Style**
[Communication skills AND teamwork approach combined in one section]

**Career Readiness & Development**
[Current preparedness AND growth recommendations combined in one section]

IMPORTANT: Do not create separate sections for Technical Competencies, Problem-Solving Approach, or Teamwork & Collaboration. Combine related topics as shown above.`;

    // Build dynamic user prompt based on available data
    let userPrompt = `STUDENT PROFILE ANALYSIS:

**Basic Information:**
• Name: ${student.name}
• Education: ${student.education?.degree || 'Not specified'} in ${student.education?.field || 'Not specified'}
• Institution: ${student.education?.institution || 'Not specified'} (${student.education?.graduationYear || 'Not specified'})
• Experience: ${student.experienceYears || student.experience?.years || 0} years
• Career Goals: ${student.careerGoals || 'Not specified'}

**Assessment Scores (0-100 scale):**
• Technical Skills: ${student.assessmentScore?.technical || 0}
• Communication: ${student.assessmentScore?.communication || 0}
• Problem-Solving: ${student.assessmentScore?.problemSolving || 0}
• Teamwork: ${student.assessmentScore?.teamwork || 0}`;

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

    userPrompt += `\n\n**CRITICAL INSTRUCTIONS:**
1. Use ONLY the 4 section headings from the system prompt
2. NEVER create separate sections for "Technical Competencies", "Problem-Solving Approach", or "Teamwork & Collaboration"
3. Combine related topics under the designated combined headings
4. Each heading must appear EXACTLY ONCE
5. If you already mentioned technical skills, do NOT create another "Technical Competencies" section

Provide analysis using only these 4 sections:
- Core Behavioral Profile
- Technical & Problem-Solving Competencies
- Communication & Collaboration Style
- Career Readiness & Development`;

    console.log('Calling OpenAI API for student summary...');
    console.log('User prompt length:', userPrompt.length);

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 1200
    });

    console.log('OpenAI API call successful');
    let summary = completion.choices[0].message.content;
    console.log('Summary generated, length:', summary.length);

    // Post-process to remove duplicate sections
    summary = removeDuplicateSections(summary);
    console.log('Summary after duplicate removal, length:', summary.length);

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
