const express = require('express');
const router = express.Router();

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