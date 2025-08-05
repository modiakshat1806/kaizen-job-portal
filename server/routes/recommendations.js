const express = require('express');
const OpenAI = require('openai');
const multer = require('multer');
const Job = require('../models/Job');
const router = express.Router();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Configure multer for audio file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024 // 25MB limit for audio files
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  }
});

// Job availability data - this would typically come from your database
const getJobAvailability = async () => {
  try {
    // Get job counts by title from database
    const jobCounts = await Job.aggregate([
      { $match: { isActive: { $ne: false } } },
      { $group: { _id: '$title', count: { $sum: 1 } } }
    ]);
    
    // Convert to object for easy lookup
    const availability = {};
    jobCounts.forEach(item => {
      availability[item._id] = item.count;
    });
    
    return availability;
  } catch (error) {
    console.error('Error fetching job availability:', error);
    return {};
  }
};

// POST /api/recommendations/generate - Generate job recommendations using OpenAI
router.post('/generate', async (req, res) => {
  try {
    const { assessmentData } = req.body;

    if (!assessmentData) {
      return res.status(400).json({ 
        error: 'Assessment data is required' 
      });
    }

    // Validate required fields
    const { fullName, coreValues, workPreferences, behavioralAnswers } = assessmentData;
    
    if (!fullName || !coreValues || !workPreferences || !behavioralAnswers) {
      return res.status(400).json({ 
        error: 'Missing required assessment data fields' 
      });
    }

    // Prepare the prompt for OpenAI
    const systemPrompt = `You are an expert career counselor and job matching specialist. Your task is to analyze a candidate's assessment data and provide a list of career matches. You will use your expertise to align the candidate's profile to a specific list of roles and present the results in a structured format.

Superset of Roles:
This is the only list of job roles you are allowed to recommend. For any new role you might think of, you must match it to the closest, most suitable role on this list.
[
'Agile Coach',
'AI Engineer',
'AI Research Scientist',
'AI Solutions Architect',
'Application Developer',
'Assembly Line Worker',
'Automation Tester',
'Back-End Developer',
'Bank Teller',
'Big Data Engineer',
'Business Analyst',
'Change Management Specialist',
'Clinical Research Associate',
'Cloud Administrator',
'Cloud Developer',
'Cloud Security Engineer',
'Cloud Solutions Architect',
'CNC Machinist',
'Compliance Analyst',
'Compliance Engineer',
'Computer Vision Engineer',
'Conversational AI Designer',
'Corporate Loan Analyst',
'Credit Officer',
'Cybersecurity Analyst',
'Cybersecurity Consultant',
'Data Analyst',
'Data Engineer',
'Data Scientist',
'Data Warehouse Developer',
'Database Administrator',
'Database Engineer',
'Deep Learning Engineer',
'Desktop Application Developer',
'DevOps Engineer',
'Digital Marketing Specialist',
'Digital Transformation Lead',
'Documentation Specialist',
'Electronics Design Engineer',
'Electronics QA Inspector',
'Embedded Software Engineer',
'Enterprise Architect',
'Ethical Hacker',
'Front-End Developer',
'Front-End Web Engineer',
'Full-Stack Developer',
'Game Developer',
'Health & Safety Officer',
'Healthcare Administrator',
'Incident Responder',
'Interaction Designer',
'Inventory Control Manager',
'IT Account Manager',
'IT Auditor',
'IT Consultant',
'IT Manager',
'IT Operations Engineer',
'IT Risk Analyst',
'IT Strategy Consultant',
'IT Support Specialist',
'Logistics Coordinator',
'Machine Learning Engineer',
'Maintenance Technician',
'Market Access Specialist',
'Medical Records Technician',
'Medical Sales Representative',
'Medical Technologist',
'Mobile App Developer',
'Network Administrator',
'Network Engineer',
'NLP Engineer',
'Patient Care Coordinator',
'Penetration Tester',
'Performance Tester',
'Pharmacovigilance Specialist',
'Physician Assistant',
'Physiotherapist',
'Pre-Sales Consultant',
'Process Consultant',
'Process Engineer',
'Procurement Specialist',
'Product Manager',
'Production Operator',
'Production Planner',
'Production Supervisor',
'Project Manager',
'Prototyping Specialist',
'QA Analyst',
'QA Engineer',
'Quality Control Analyst',
'Quality Inspector',
'Quantitative Analyst',
'Radiology Technician',
'Regulatory Affairs Specialist',
'Relationship Manager',
'Reliability Engineer',
'Research Scientist',
'Scrum Master',
'Security Architect',
'Security Engineer',
'Site Reliability Engineer',
'Software Architect',
'Software Tester',
'Solutions Consultant',
'Speech-Language Pathologist',
'SQL Developer',
'Staff Nurse',
'Supply Chain Specialist',
'System Administrator',
'Systems Analyst',
'Technical Product Manager',
'Technical Sales Engineer',
'Technical Writer',
'Technology Analyst',
'Test Automation Engineer',
'UI Developer',
'UI/UX Researcher',
'UX Designer',
'UX Engineer',
'Vulnerability Analyst',
'Web Developer'
]

Task:
1. Carefully analyze the candidate's core values, work preferences, and behavioral traits.
2. Select 3-6 of the most suitable internship roles for this candidate from the Superset of Roles list.
3. For each selected role, provide a jobTitle, a one-line jobDescription for an internship position, a Unicode emoji for a relevantLogo, and three small bullet points in a whyYouMatch array explaining the fit.
4. Provide a fitmentScore from 0 to 100, where 100 is a perfect match and 0 is no match.

The entire response MUST be a single JSON object that strictly adheres to the following schema:
{
  "matches": [
    {
      "jobTitle": "string",
      "fitmentScore": "number",
      "jobDescription": "string",
      "relevantLogo": "string",
      "whyYouMatch": ["string", "string", "string"]
    }
  ]
}`;

    const userPrompt = `Candidate Assessment Data:
Full Name: ${fullName}
Core Values: ${JSON.stringify(coreValues)}
Work Preferences: ${JSON.stringify(workPreferences)}
Behavioral Answers: ${JSON.stringify(behavioralAnswers)}

Please analyze this candidate's profile and provide job recommendations.`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    // Parse the response
    const responseContent = completion.choices[0].message.content;
    let recommendations;

    try {
      // Clean the response content - remove markdown code blocks if present
      let cleanContent = responseContent.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      recommendations = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      console.error('Raw response content:', responseContent);
      return res.status(500).json({
        error: 'Failed to parse AI recommendations',
        details: 'The AI response was not in valid JSON format'
      });
    }

    // Get job availability data
    const jobAvailability = await getJobAvailability();

    // Add job availability to each recommendation
    const enrichedRecommendations = recommendations.matches.map(match => ({
      ...match,
      availableJobs: jobAvailability[match.jobTitle] || 0
    }));

    res.json({
      message: 'Job recommendations generated successfully',
      recommendations: enrichedRecommendations,
      totalRecommendations: enrichedRecommendations.length,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating recommendations:', error);
    
    if (error.code === 'insufficient_quota') {
      return res.status(429).json({ 
        error: 'OpenAI API quota exceeded',
        message: 'Please try again later or contact support'
      });
    }
    
    if (error.code === 'invalid_api_key') {
      return res.status(401).json({ 
        error: 'Invalid OpenAI API key',
        message: 'Please check your API key configuration'
      });
    }

    res.status(500).json({ 
      error: 'Failed to generate job recommendations',
      message: error.message 
    });
  }
});

// POST /api/recommendations/voice-process - Process voice input for job posting
router.post('/voice-process', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No audio file provided'
      });
    }

    console.log('Processing voice input, file size:', req.file.size);

    // Step 1: Convert audio to text using Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: new File([req.file.buffer], 'audio.webm', { type: req.file.mimetype }),
      model: 'whisper-1',
      language: 'en', // English with Indian accent support
      response_format: 'text'
    });

    console.log('Transcription:', transcription);

    // Step 2: Use GPT to extract structured data from the transcription
    const extractionPrompt = `
Extract job posting information from this voice input: "${transcription}"

Please extract the following fields and return as JSON:
{
  "title": "job title/position",
  "companyName": "company name",
  "jobType": "Full-time/Part-time/Contract/Internship",
  "industry": "industry sector",
  "contactPersonName": "person's name",
  "contactPersonPhone": "phone number with +91 if Indian number"
}

Rules:
- If a field is not mentioned, set it to null
- For jobType, standardize to: Full-time, Part-time, Contract, or Internship
- For phone numbers, add +91 prefix if it's a 10-digit Indian number
- Clean up company names (remove "company", "ltd", etc.)
- Extract the actual person's name (remove titles like Mr, Mrs, etc.)

Return only the JSON object, no other text.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at extracting structured data from voice transcriptions. Always return valid JSON.'
        },
        {
          role: 'user',
          content: extractionPrompt
        }
      ],
      temperature: 0.1,
      max_tokens: 500
    });

    const extractedData = JSON.parse(completion.choices[0].message.content);
    console.log('Extracted data:', extractedData);

    res.json({
      success: true,
      transcription,
      extractedData,
      message: 'Voice input processed successfully'
    });

  } catch (error) {
    console.error('Voice processing error:', error);

    if (error.code === 'insufficient_quota') {
      return res.status(429).json({
        error: 'OpenAI API quota exceeded',
        message: 'Please try again later or contact support'
      });
    }

    res.status(500).json({
      error: 'Failed to process voice input',
      message: error.message
    });
  }
});

module.exports = router;
