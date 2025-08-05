const express = require('express');
const multer = require('multer');
const OpenAI = require('openai');
const router = express.Router();

// Configure multer for audio file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024 // 25MB limit for Whisper
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files and video files (for webm)
    if (file.mimetype.startsWith('audio/') || file.mimetype.includes('webm')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  }
});

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// POST /api/voice/transcribe - Speech to Text using OpenAI Whisper
router.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Audio file is required' });
    }

    console.log('Received audio file:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // Create a File object for OpenAI Whisper
    const audioFile = new File([req.file.buffer], req.file.originalname || 'audio.webm', {
      type: req.file.mimetype
    });

    // Use OpenAI Whisper for transcription
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'en', // English with support for Indian accents
      response_format: 'verbose_json', // Get detailed response with confidence
      temperature: 0.2 // Lower temperature for more accurate transcription
    });

    console.log('Whisper transcription result:', transcription);

    res.json({
      transcript: transcription.text,
      language: transcription.language,
      duration: transcription.duration,
      segments: transcription.segments || []
    });

  } catch (error) {
    console.error('Whisper transcription error:', error);
    res.status(500).json({
      error: 'Speech transcription failed',
      message: error.message
    });
  }
});

// POST /api/voice/extract-fields - Extract form fields from transcript using OpenAI
router.post('/extract-fields', async (req, res) => {
  try {
    const { transcript, formType = 'student_assessment' } = req.body;

    if (!transcript) {
      return res.status(400).json({ error: 'Transcript is required' });
    }

    console.log('Extracting fields from transcript:', transcript);

    // Define prompts for different form types
    const extractionPrompts = {
      student_assessment: `
        Extract the following information from this speech transcript and return it as a JSON object:
        - name: Full name of the person
        - email: Email address
        - phone: Phone number (10 digits, clean format)
        - degree: Educational degree (BE, BTech, MSc, MTech, MBA, BBA, BCom, BCA, MCA)
        - specialization: Field of study/specialization
        - institution: College/University name
        - graduationYear: Year of graduation (4 digits)

        Transcript: "${transcript}"

        Return only valid JSON with the extracted fields. If a field is not mentioned, use null.
        Example: {"name": "John Doe", "email": "john@example.com", "phone": "9876543210", "degree": "BTech", "specialization": "Computer Science", "institution": "ABC University", "graduationYear": 2024}
      `,
      job_posting: `
        Extract job posting information from this speech transcript and return it as a JSON object:
        - title: Job title (e.g., "Software Engineer", "Data Scientist")
        - company: Company name
        - description: Brief job description
        - location: Job location/city
        - salary: Salary range or amount (extract numbers)
        - requirements: Experience requirements or skills mentioned
        - industry: Industry type (must be one of: Technology, Healthcare, Finance, Education, Retail, Manufacturing, Consulting, Marketing, Government, Non-profit, Other)
        - jobType: Employment type (must be one of: Full-time, Part-time, Contract, Internship, Freelance, Remote)
        - contactName: Contact person name
        - contactPhone: Contact phone number

        Transcript: "${transcript}"

        Return only valid JSON with the extracted fields. If a field is not mentioned, use null.
        IMPORTANT: For industry, use exact values: Technology, Healthcare, Finance, Education, Retail, Manufacturing, Consulting, Marketing, Government, Non-profit, Other
        IMPORTANT: For jobType, use exact values: Full-time, Part-time, Contract, Internship, Freelance, Remote

        Example: {"title": "Software Engineer", "company": "Google", "description": "Develop web applications", "location": "Bangalore", "salary": "800000", "requirements": "3 years experience", "industry": "Technology", "jobType": "Full-time", "contactName": "John Smith", "contactPhone": "9876543210"}
      `
    };

    const prompt = extractionPrompts[formType] || extractionPrompts.student_assessment;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert at extracting structured information from speech transcripts. Always return valid JSON only, no additional text or explanations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.1
    });

    const extractedText = completion.choices[0].message.content.trim();
    console.log('OpenAI extraction result:', extractedText);

    // Parse the JSON response
    let extractedFields;
    try {
      extractedFields = JSON.parse(extractedText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      // Try to extract JSON from the response if it's wrapped in other text
      const jsonMatch = extractedText.match(/\{.*\}/s);
      if (jsonMatch) {
        extractedFields = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse extracted fields as JSON');
      }
    }

    res.json({
      transcript,
      extractedFields,
      success: true
    });

  } catch (error) {
    console.error('Field extraction error:', error);
    res.status(500).json({
      error: 'Failed to extract fields from transcript',
      message: error.message
    });
  }
});

module.exports = router;
