const express = require('express');
const multer = require('multer');
const { SpeechConfig, AudioConfig, SpeechRecognizer, SpeechSynthesizer } = require('microsoft-cognitiveservices-speech-sdk');
const OpenAI = require('openai');
const router = express.Router();

// Configure multer for audio file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  }
});

// Initialize Azure Speech and OpenAI clients
const speechConfig = SpeechConfig.fromSubscription(
  process.env.AZURE_SPEECH_KEY,
  process.env.AZURE_SPEECH_REGION
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Configure speech recognition for noise robustness and Indian accents
speechConfig.speechRecognitionLanguage = "en-IN";
speechConfig.setProperty("SpeechServiceConnection_EnableAudioLogging", "false");
speechConfig.setProperty("SpeechServiceConnection_InitialSilenceTimeoutMs", "5000");
speechConfig.setProperty("SpeechServiceConnection_EndSilenceTimeoutMs", "2000");

// POST /api/voice/synthesize - Text to Speech
router.post('/synthesize', async (req, res) => {
  try {
    const { text, voiceConfig = {} } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Configure voice settings for professional male voice
    const synthesizer = new SpeechSynthesizer(speechConfig);
    
    // Use SSML for better voice control
    const ssml = `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
        <voice name="en-US-DavisNeural">
          <prosody rate="${voiceConfig.rate || '0.9'}" pitch="${voiceConfig.pitch || '-5%'}">
            ${text}
          </prosody>
        </voice>
      </speak>
    `;

    synthesizer.speakSsmlAsync(
      ssml,
      (result) => {
        if (result.reason === 1) { // Success
          res.set({
            'Content-Type': 'audio/wav',
            'Content-Length': result.audioData.byteLength
          });
          res.send(Buffer.from(result.audioData));
        } else {
          res.status(500).json({ error: 'Speech synthesis failed' });
        }
        synthesizer.close();
      },
      (error) => {
        console.error('TTS Error:', error);
        res.status(500).json({ error: 'Speech synthesis error' });
        synthesizer.close();
      }
    );

  } catch (error) {
    console.error('TTS Route Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/voice/recognize - Speech to Text with noise handling
router.post('/recognize', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Audio file is required' });
    }

    const { noiseProfile = 'conference', accentHint = 'indian' } = req.body;

    // Configure audio input from buffer
    const audioConfig = AudioConfig.fromWavFileInput(req.file.buffer);
    
    // Configure recognition for specific scenarios
    const recognitionConfig = { ...speechConfig };
    
    // Adjust for noise environment
    switch (noiseProfile) {
      case 'conference':
        recognitionConfig.setProperty("SpeechServiceConnection_SingleShotMode", "true");
        recognitionConfig.setProperty("SpeechServiceConnection_EnableAudioLogging", "false");
        break;
      case 'crowd':
        recognitionConfig.setProperty("SpeechServiceConnection_InitialSilenceTimeoutMs", "3000");
        recognitionConfig.setProperty("SpeechServiceConnection_EndSilenceTimeoutMs", "1500");
        break;
    }

    // Adjust for accent hints
    if (accentHint === 'indian') {
      recognitionConfig.speechRecognitionLanguage = "en-IN";
    }

    const recognizer = new SpeechRecognizer(recognitionConfig, audioConfig);

    recognizer.recognizeOnceAsync(
      (result) => {
        if (result.reason === 3) { // RecognizedSpeech
          res.json({
            transcript: result.text,
            confidence: result.properties.getProperty('SpeechServiceResponse_JsonResult') || 0.8,
            duration: result.duration / 10000000, // Convert to seconds
            language: recognitionConfig.speechRecognitionLanguage
          });
        } else {
          res.status(400).json({ 
            error: 'Speech not recognized',
            reason: result.reason,
            errorDetails: result.errorDetails
          });
        }
        recognizer.close();
      },
      (error) => {
        console.error('STT Error:', error);
        res.status(500).json({ error: 'Speech recognition error' });
        recognizer.close();
      }
    );

  } catch (error) {
    console.error('STT Route Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/voice/extract - NLP Entity Extraction
router.post('/extract', async (req, res) => {
  try {
    const { transcript, fieldType, context = {} } = req.body;

    if (!transcript || !fieldType) {
      return res.status(400).json({ error: 'Transcript and fieldType are required' });
    }

    // Define field-specific extraction prompts
    const extractionPrompts = {
      title: `Extract the job title from this speech: "${transcript}". Remove filler words and return only the job title.`,
      company: `Extract the company name from this speech: "${transcript}". Remove filler words and return only the company name.`,
      type: `Extract the job type from this speech: "${transcript}". Standardize to one of: Full-time, Part-time, Contract, Internship. If unclear, return "Full-time".`,
      industry: `Extract the industry from this speech: "${transcript}". Standardize to common industry names like Technology, Finance, Healthcare, etc.`,
      recruiterName: `Extract the person's name from this speech: "${transcript}". Return only the name, removing titles or filler words.`,
      recruiterContact: `Extract the phone number from this speech: "${transcript}". Return only the phone number in a clean format.`
    };

    const prompt = extractionPrompts[fieldType] || `Extract relevant information for ${fieldType} from: "${transcript}"`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert at extracting specific information from speech transcripts. Always return only the requested information, cleaned of filler words and formatted appropriately."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 100,
      temperature: 0.1
    });

    const extractedValue = completion.choices[0].message.content.trim();

    // Post-process based on field type
    let processedValue = extractedValue;
    
    switch (fieldType) {
      case 'type':
        // Ensure job type is standardized
        const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship'];
        const matchedType = jobTypes.find(type => 
          extractedValue.toLowerCase().includes(type.toLowerCase())
        );
        processedValue = matchedType || 'Full-time';
        break;
        
      case 'recruiterContact':
        // Clean phone number format
        processedValue = extractedValue.replace(/[^\d\+\-\s\(\)]/g, '');
        break;
    }

    res.json({
      extractedValue: processedValue,
      originalTranscript: transcript,
      fieldType: fieldType,
      confidence: 0.9, // Could be enhanced with actual confidence scoring
      processingTime: Date.now()
    });

  } catch (error) {
    console.error('NLP Extraction Error:', error);
    res.status(500).json({ error: 'Entity extraction failed' });
  }
});

// POST /api/voice/validate - Validate extracted information
router.post('/validate', async (req, res) => {
  try {
    const { fieldType, value, context = {} } = req.body;

    if (!fieldType || !value) {
      return res.status(400).json({ error: 'FieldType and value are required' });
    }

    const validationRules = {
      title: {
        minLength: 2,
        maxLength: 100,
        pattern: /^[a-zA-Z0-9\s\-\+\.]+$/
      },
      company: {
        minLength: 2,
        maxLength: 100,
        pattern: /^[a-zA-Z0-9\s\-\+\.&]+$/
      },
      type: {
        allowedValues: ['Full-time', 'Part-time', 'Contract', 'Internship']
      },
      recruiterContact: {
        pattern: /^[\d\+\-\s\(\)]{10,15}$/
      }
    };

    const rules = validationRules[fieldType];
    let isValid = true;
    let errors = [];

    if (rules) {
      if (rules.minLength && value.length < rules.minLength) {
        isValid = false;
        errors.push(`Minimum length is ${rules.minLength}`);
      }
      
      if (rules.maxLength && value.length > rules.maxLength) {
        isValid = false;
        errors.push(`Maximum length is ${rules.maxLength}`);
      }
      
      if (rules.pattern && !rules.pattern.test(value)) {
        isValid = false;
        errors.push('Invalid format');
      }
      
      if (rules.allowedValues && !rules.allowedValues.includes(value)) {
        isValid = false;
        errors.push(`Must be one of: ${rules.allowedValues.join(', ')}`);
      }
    }

    res.json({
      isValid,
      errors,
      fieldType,
      value,
      suggestions: isValid ? [] : generateSuggestions(fieldType, value)
    });

  } catch (error) {
    console.error('Validation Error:', error);
    res.status(500).json({ error: 'Validation failed' });
  }
});

// Helper function to generate suggestions for invalid values
function generateSuggestions(fieldType, value) {
  const suggestions = [];
  
  switch (fieldType) {
    case 'type':
      suggestions.push('Try saying: "Full-time", "Part-time", "Contract", or "Internship"');
      break;
    case 'recruiterContact':
      suggestions.push('Please provide a valid phone number with country code');
      break;
    default:
      suggestions.push('Please try speaking more clearly');
  }
  
  return suggestions;
}

// Error handling middleware
router.use((error, req, res, next) => {
  console.error('Voice API Error:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Audio file too large' });
    }
  }
  
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = router;
