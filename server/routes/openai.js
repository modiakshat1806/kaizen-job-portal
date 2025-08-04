const express = require('express');
const OpenAI = require('openai');
const router = express.Router();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Route to get career matches using OpenAI
router.post('/career-matches', async (req, res) => {
    try {
        const { assessmentData } = req.body;

        if (!assessmentData) {
            return res.status(400).json({
                error: 'Assessment data is required'
            });
        }

        const careerRoles = [
            'Software Engineer', 'Data Scientist', 'Product Manager', 'UX Designer',
            'Marketing Specialist', 'Business Analyst', 'DevOps Engineer', 'Cybersecurity Analyst',
            'Digital Marketing Manager', 'Content Writer', 'Graphic Designer', 'Sales Representative',
            'HR Specialist', 'Financial Analyst', 'Project Manager', 'Quality Assurance Engineer',
            'Mobile App Developer', 'Web Developer', 'Database Administrator', 'Network Engineer',
            'Technical Writer', 'Social Media Manager', 'SEO Specialist', 'Customer Success Manager',
            'Operations Manager', 'Supply Chain Analyst', 'Research Scientist', 'UI Developer',
            'Machine Learning Engineer', 'Cloud Architect', 'Scrum Master', 'Business Development Manager'
        ];

        const prompt = `
You are an expert career counselor. Analyze the following student assessment data and recommend the most suitable career roles.

STUDENT ASSESSMENT DATA:
- Name: ${assessmentData.basicDetails?.name || 'Not provided'}
- Education: ${assessmentData.basicDetails?.degree || 'Not provided'} in ${assessmentData.basicDetails?.specialization || 'Not provided'}
- Institution: ${assessmentData.basicDetails?.institution || 'Not provided'}
- Graduation Year: ${assessmentData.basicDetails?.graduationYear || 'Not provided'}
- Core Values: ${assessmentData.coreValues?.join(', ') || 'Not provided'}
- Work Preferences: ${JSON.stringify(assessmentData.workPreferences) || 'Not provided'}
- Work Style Responses: ${JSON.stringify(assessmentData.workStyle) || 'Not provided'}

AVAILABLE CAREER ROLES:
${careerRoles.join(', ')}

TASK:
Analyze the student's core values, work preferences, and behavioral traits. Select 4-6 of the most suitable career roles from the available list.

For each selected role, provide:
1. jobTitle (from the available roles list)
2. jobDescription (one-line description for an entry-level/internship position)
3. relevantLogo (a single relevant emoji)
4. whyYouMatch (array of 3 specific reasons why this role fits the student)
5. fitmentScore (0-100, where 100 is perfect match)

Respond with a JSON object in this exact format:
{
  "matches": [
    {
      "jobTitle": "Role Name",
      "jobDescription": "Brief description of entry-level position",
      "relevantLogo": "📊",
      "whyYouMatch": [
        "Specific reason 1",
        "Specific reason 2",
        "Specific reason 3"
      ],
      "fitmentScore": 85
    }
  ]
}
`;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are an expert career counselor specializing in matching students with suitable career paths based on their assessment data."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.3,
            max_tokens: 2000
        });

        const response = completion.choices[0].message.content;
        const careerMatches = JSON.parse(response);

        res.json({
            message: 'Career matches generated successfully',
            matches: careerMatches.matches || []
        });

    } catch (error) {
        console.error('Error generating career matches:', error);
        res.status(500).json({
            error: 'Failed to generate career matches',
            message: error.message
        });
    }
});

// Route to get OpenAI API key (this will be called by the frontend)
router.get('/openai-key', (req, res) => {
    try {
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                error: 'OpenAI API key not configured'
            });
        }

        // Return the API key to the frontend
        res.json({ apiKey });
    } catch (error) {
        console.error('Error getting OpenAI API key:', error);
        res.status(500).json({
            error: 'Failed to get API key'
        });
    }
});

module.exports = router;