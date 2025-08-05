import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Building, MapPin, DollarSign, Users, FileText, Plus, X, Eye, Edit, Trash2, Download, Share2, Mic, MicOff, Volume2, ChevronDown } from 'lucide-react'
import { jobAPI, voiceAPI } from '../services/api'

const JobPostingForm = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Add CSS animations for 3D job posting title effect and voice button
  useEffect(() => {
    const jobAnimationStyles = `
      @keyframes jobTitlePop {
        0% {
          transform: scale(0.8) translateY(20px) rotateX(10deg);
          opacity: 0;
        }
        60% {
          transform: scale(1.05) translateY(-3px) rotateX(-3deg);
          opacity: 0.9;
        }
        100% {
          transform: scale(1) translateY(0) rotateX(0deg);
          opacity: 1;
        }
      }

      @keyframes voiceButtonFloat {
        0%, 100% {
          transform: translateY(0px) rotateY(0deg);
        }
        50% {
          transform: translateY(-2px) rotateY(5deg);
        }
      }

      @keyframes voicePulse {
        0% {
          transform: scale(1);
          box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.7);
        }
        70% {
          transform: scale(1.05);
          box-shadow: 0 0 0 10px rgba(139, 92, 246, 0);
        }
        100% {
          transform: scale(1);
          box-shadow: 0 0 0 0 rgba(139, 92, 246, 0);
        }
      }

      @keyframes micRotate {
        0% { transform: rotateY(0deg) rotateX(0deg); }
        25% { transform: rotateY(90deg) rotateX(10deg); }
        50% { transform: rotateY(180deg) rotateX(0deg); }
        75% { transform: rotateY(270deg) rotateX(-10deg); }
        100% { transform: rotateY(360deg) rotateX(0deg); }
      }

      .voice-button-active {
        animation: voicePulse 2s infinite, voiceButtonFloat 3s ease-in-out infinite;
      }

      .voice-button-inactive:hover {
        animation: voiceButtonFloat 1s ease-in-out infinite;
      }

      .mic-icon-active {
        animation: micRotate 2s linear infinite;
      }

      @keyframes slideInRight {
        0% {
          transform: translateX(100%) translateY(-50%);
          opacity: 0;
        }
        100% {
          transform: translateX(0) translateY(-50%);
          opacity: 1;
        }
      }

      @keyframes slideDown {
        from {
          max-height: 0;
          opacity: 0;
          transform: translateY(-15px) perspective(1000px) rotateX(-10deg);
        }
        to {
          max-height: 1000px;
          opacity: 1;
          transform: translateY(0) perspective(1000px) rotateX(0deg);
        }
      }

      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px) scale(0.95) perspective(1000px) rotateX(5deg);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1) perspective(1000px) rotateX(0deg);
        }
      }

      .dropdown-content {
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        transform-style: preserve-3d;
      }

      .dropdown-button {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        transform-style: preserve-3d;
      }

      .dropdown-button:hover {
        transform: translateY(-2px) scale(1.01) perspective(1000px) rotateX(2deg);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
      }

      .dropdown-arrow {
        transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        transform-style: preserve-3d;
      }

      @keyframes dropdownSlideIn {
        0% {
          opacity: 0;
          transform: translateY(-15px) scale(0.95) perspective(1000px) rotateX(-10deg);
          filter: blur(4px);
        }
        60% {
          opacity: 0.8;
          transform: translateY(2px) scale(1.02) perspective(1000px) rotateX(2deg);
          filter: blur(1px);
        }
        100% {
          opacity: 1;
          transform: translateY(0) scale(1) perspective(1000px) rotateX(0deg);
          filter: blur(0px);
        }
      }

      @keyframes dropdownItemSlideIn {
        0% {
          opacity: 0;
          transform: translateY(-10px) translateX(-5px) scale(0.95);
        }
        60% {
          opacity: 0.8;
          transform: translateY(1px) translateX(1px) scale(1.02);
        }
        100% {
          opacity: 1;
          transform: translateY(0) translateX(0) scale(1);
        }
      }

      .job-title-dropdown {
        transform-style: preserve-3d;
        perspective: 1000px;
      }

      .job-title-dropdown-item {
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        transform-style: preserve-3d;
      }

      .job-title-dropdown-item:hover {
        transform: translateX(3px) translateZ(5px) perspective(1000px) rotateY(2deg);
        box-shadow: 0 4px 12px rgba(147, 51, 234, 0.15);
      }
    `
    const styleSheet = document.createElement('style')
    styleSheet.textContent = jobAnimationStyles
    document.head.appendChild(styleSheet)
    return () => document.head.removeChild(styleSheet)
  }, [])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [responsibilities, setResponsibilities] = useState([''])
  const [benefits, setBenefits] = useState([''])
  const [requiredSkills, setRequiredSkills] = useState([''])
  const [previewData, setPreviewData] = useState(null)
  const navigate = useNavigate()

  // Voice functionality state
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessingVoice, setIsProcessingVoice] = useState(false)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const streamRef = useRef(null)

  const { register, handleSubmit, formState: { errors }, watch, setValue, getValues } = useForm()

  // Watch location type to disable location fields for remote jobs
  const locationType = watch('location.type')



  // Optional fields dropdown states
  const [expandedOptionalFields, setExpandedOptionalFields] = useState({
    location: false,
    salary: false,
    benefits: false,
    requirements: false,
    responsibilities: false
  })

  // Job title autocomplete state
  const [jobTitleSuggestions, setJobTitleSuggestions] = useState([])
  const [showJobTitleSuggestions, setShowJobTitleSuggestions] = useState(false)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)

  // Job title suggestions database - Comprehensive career roles list
  const jobTitleDatabase = [
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

  // Job title autocomplete functionality
  const handleJobTitleChange = (e) => {
    const value = e.target.value
    setValue('title', value)
    setSelectedSuggestionIndex(-1)

    if (value.length >= 1) {
      // Prioritize exact matches and starts-with matches
      const exactMatches = jobTitleDatabase.filter(title =>
        title.toLowerCase() === value.toLowerCase()
      )

      const startsWithMatches = jobTitleDatabase.filter(title =>
        title.toLowerCase().startsWith(value.toLowerCase()) &&
        !exactMatches.includes(title)
      )

      const containsMatches = jobTitleDatabase.filter(title =>
        title.toLowerCase().includes(value.toLowerCase()) &&
        !exactMatches.includes(title) &&
        !startsWithMatches.includes(title)
      )

      const suggestions = [...exactMatches, ...startsWithMatches, ...containsMatches].slice(0, 8)
      setJobTitleSuggestions(suggestions)
      setShowJobTitleSuggestions(suggestions.length > 0)
    } else {
      setShowJobTitleSuggestions(false)
    }
  }

  const selectJobTitle = (title) => {
    setValue('title', title)
    setShowJobTitleSuggestions(false)
    setSelectedSuggestionIndex(-1)
  }

  const handleJobTitleKeyDown = (e) => {
    if (!showJobTitleSuggestions) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedSuggestionIndex(prev =>
          prev < jobTitleSuggestions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedSuggestionIndex(prev =>
          prev > 0 ? prev - 1 : jobTitleSuggestions.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (selectedSuggestionIndex >= 0) {
          selectJobTitle(jobTitleSuggestions[selectedSuggestionIndex])
        } else if (jobTitleSuggestions.length > 0) {
          selectJobTitle(jobTitleSuggestions[0])
        }
        break
      case 'Tab':
        if (jobTitleSuggestions.length > 0) {
          e.preventDefault()
          selectJobTitle(selectedSuggestionIndex >= 0 ?
            jobTitleSuggestions[selectedSuggestionIndex] :
            jobTitleSuggestions[0]
          )
        }
        break
      case 'Escape':
        setShowJobTitleSuggestions(false)
        setSelectedSuggestionIndex(-1)
        break
    }
  }

  // Close dropdown when clicking outside
  const handleJobTitleBlur = () => {
    // Delay to allow click on suggestion to register
    setTimeout(() => {
      setShowJobTitleSuggestions(false)
      setSelectedSuggestionIndex(-1)
    }, 150)
  }

  // Optional fields toggle functionality
  const toggleOptionalField = (fieldName) => {
    setExpandedOptionalFields(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName]
    }))
  }

  // Voice recording functions using OpenAI Whisper
  const startVoiceRecording = async () => {
    try {
      setIsRecording(true)
      audioChunksRef.current = []

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })

      streamRef.current = stream
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        await processVoiceInput(audioBlob)

        // Clean up
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
        }
      }

      mediaRecorderRef.current.start()
      toast.success('🎤 Recording started! Speak your job details clearly.')

      // Auto-stop after 30 seconds
      setTimeout(() => {
        if (isRecording) {
          stopVoiceRecording()
        }
      }, 30000)

    } catch (error) {
      console.error('Voice recording error:', error)
      setIsRecording(false)

      if (error.name === 'NotAllowedError') {
        toast.error('Microphone access denied. Please allow microphone access.')
      } else {
        toast.error('Failed to start recording. Please try again.')
      }
    }
  }

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      toast.info('Processing your voice input...')
    }
  }

  const listenForComprehensiveResponse = () => {
    return new Promise((resolve) => {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        toast.error('Speech recognition not supported in this browser')
        setIsVoiceActive(false)
        resolve()
        return
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognition = new SpeechRecognition()

      // Enhanced settings for Indian accents and noise handling
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-IN' // Indian English
      recognition.maxAlternatives = 3 // Multiple alternatives for better accuracy

      // Additional settings for noise robustness
      if (recognition.serviceURI) {
        recognition.serviceURI = 'wss://speech.googleapis.com/v1/speech:recognize'
      }

      setIsListening(true)
      setVoiceProgress(25)

      let finalTranscript = ''
      let interimTranscript = ''

      recognition.onresult = async (event) => {
        // Handle both interim and final results for better accuracy
        interimTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          const transcript = result[0].transcript

          if (result.isFinal) {
            finalTranscript += transcript + ' '
          } else {
            interimTranscript += transcript
          }
        }

        // Show interim results to user
        if (interimTranscript) {
          console.log('Interim:', interimTranscript)
        }

        // Process when we have substantial final transcript
        if (finalTranscript.trim().length > 10) {
          console.log('Final transcript:', finalTranscript)
          setVoiceProgress(50)

          // Process the comprehensive response
          await processComprehensiveResponse(finalTranscript.trim())

          setIsListening(false)
          setVoiceProgress(100)

          setTimeout(() => {
            setIsVoiceActive(false)
            setVoiceProgress(0)
            toast.success('Voice entry completed!')
          }, 1500)

          recognition.stop()
          resolve()
        }
      }

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
        setIsVoiceActive(false)

        if (event.error === 'no-speech') {
          toast.error('No speech detected. Please try again.')
        } else {
          toast.error('Speech recognition error. Please try again.')
        }

        resolve()
      }

      recognition.start()

      // Auto-stop after 20 seconds for better user experience
      setTimeout(() => {
        if (recognition && !finalTranscript.trim()) {
          recognition.stop()
          toast.info('Voice timeout. Please speak all details in one go and try again.')
        }
      }, 20000)
    })
  }

  const startRecording = async (stream) => {
    return new Promise((resolve, reject) => {
      try {
        audioChunksRef.current = []

        console.log('Starting MediaRecorder...') // Debug log

        // Check supported MIME types
        let mimeType = 'audio/webm;codecs=opus'
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/webm'
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'audio/mp4'
            if (!MediaRecorder.isTypeSupported(mimeType)) {
              mimeType = '' // Let browser choose
            }
          }
        }

        console.log('Using MIME type:', mimeType) // Debug log

        // Create MediaRecorder with optimal settings
        const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : {})

        mediaRecorderRef.current = mediaRecorder
        setIsRecording(true)
        setVoiceProgress(25)

      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1
          if (newTime >= 15) { // Auto-stop after 15 seconds
            stopRecording()
          }
          return newTime
        })
      }, 1000)

        mediaRecorder.ondataavailable = (event) => {
          console.log('Data available, size:', event.data.size) // Debug log
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data)
          }
        }

        mediaRecorder.onstop = async () => {
          console.log('Recording stopped') // Debug log
          setIsRecording(false)
          setVoiceProgress(50)

          // Stop the stream
          stream.getTracks().forEach(track => track.stop())

          // Create audio blob
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType || 'audio/webm' })
          console.log('Audio blob created, size:', audioBlob.size) // Debug log

          // Process with OpenAI
          await processAudioWithOpenAI(audioBlob)
          resolve()
        }

        mediaRecorder.onerror = (event) => {
          console.error('MediaRecorder error:', event.error)
          toast.error('Recording error occurred')
          setIsRecording(false)
          setIsVoiceActive(false)
          stream.getTracks().forEach(track => track.stop())
          reject(event.error)
        }

        console.log('Starting recording...') // Debug log
        mediaRecorder.start()

        // Auto-stop after 15 seconds
        setTimeout(() => {
          if (mediaRecorder.state === 'recording') {
            console.log('Auto-stopping recording after 15 seconds') // Debug log
            mediaRecorder.stop()
          }
        }, 15000)

      } catch (error) {
        console.error('Error in startRecording:', error)
        toast.error('Failed to start recording')
        setIsRecording(false)
        setIsVoiceActive(false)
        stream.getTracks().forEach(track => track.stop())
        reject(error)
      }
    })
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current)
    }
  }

  const processVoiceInput = async (audioBlob) => {
    try {
      setIsProcessingVoice(true)

      // Step 1: Transcribe audio using Whisper
      const transcriptionResponse = await voiceAPI.transcribe(audioBlob)
      const transcript = transcriptionResponse.data.transcript

      console.log('Transcription:', transcript)
      toast.success('Voice transcribed successfully!')

      // Step 2: Extract fields from transcript
      const extractionResponse = await voiceAPI.extractFields(transcript, 'job_posting')
      const extractedFields = extractionResponse.data.extractedFields

      console.log('Extracted fields:', extractedFields)

      // Step 3: Populate form fields
      let fieldsPopulated = 0

      if (extractedFields.title) {
        setValue('title', extractedFields.title)
        fieldsPopulated++
      }
      if (extractedFields.company) {
        setValue('company.name', extractedFields.company)
        fieldsPopulated++
      }
      if (extractedFields.description) {
        setValue('description', extractedFields.description)
        fieldsPopulated++
      }
      if (extractedFields.location) {
        setValue('location.city', extractedFields.location)
        fieldsPopulated++
      }
      if (extractedFields.salary) {
        setValue('salary.min', extractedFields.salary)
        fieldsPopulated++
      }
      if (extractedFields.requirements) {
        setValue('requirements.experience', extractedFields.requirements)
        fieldsPopulated++
      }
      if (extractedFields.industry) {
        setValue('industry', extractedFields.industry)
        fieldsPopulated++
      }
      if (extractedFields.jobType) {
        setValue('jobType', extractedFields.jobType)
        fieldsPopulated++
      }
      if (extractedFields.contactName) {
        setValue('contactPerson.name', extractedFields.contactName)
        fieldsPopulated++
      }
      if (extractedFields.contactPhone) {
        setValue('contactPerson.phone', extractedFields.contactPhone)
        fieldsPopulated++
      }

      toast.success(`🎉 ${fieldsPopulated} form fields populated from voice input!`)

      toast.success('Form fields populated from voice input!')

    } catch (error) {
      console.error('Voice processing error:', error)
      toast.error('Failed to process voice input. Please try again.')
    } finally {
      setIsProcessingVoice(false)
    }
  }

  const applyExtractedDataToForm = async (extractedData, transcription = '') => {
    console.log('Applying extracted data to form:', extractedData) // Debug log

    const detected = {}
    let detectedCount = 0

    // Map the extracted data to form fields
    if (extractedData.title) {
      setValue('title', extractedData.title)
      detected.title = extractedData.title
      detectedCount++
      console.log('Set title:', extractedData.title) // Debug log
    }

    if (extractedData.companyName) {
      setValue('company.name', extractedData.companyName)
      detected['company.name'] = extractedData.companyName
      detectedCount++
      console.log('Set company name:', extractedData.companyName) // Debug log
    }

    if (extractedData.jobType) {
      setValue('jobType', extractedData.jobType)
      detected.jobType = extractedData.jobType
      detectedCount++
      console.log('Set job type:', extractedData.jobType) // Debug log
    }

    if (extractedData.industry) {
      setValue('industry', extractedData.industry)
      detected.industry = extractedData.industry
      detectedCount++
      console.log('Set industry:', extractedData.industry) // Debug log
    }

    if (extractedData.contactPersonName) {
      setValue('contactPerson.name', extractedData.contactPersonName)
      detected['contactPerson.name'] = extractedData.contactPersonName
      detectedCount++
      console.log('Set contact name:', extractedData.contactPersonName) // Debug log
    }

    if (extractedData.contactPersonPhone) {
      setValue('contactPerson.phone', extractedData.contactPersonPhone)
      detected['contactPerson.phone'] = extractedData.contactPersonPhone
      detectedCount++
      console.log('Set contact phone:', extractedData.contactPersonPhone) // Debug log
    }

    setDetectedAnswers(detected)

    // Show success message with details
    if (detectedCount > 0) {
      const detectedFields = Object.keys(detected).map(field => {
        const fieldConfig = voiceFields.find(f => f.field === field)
        return fieldConfig ? fieldConfig.label : field
      }).join(', ')

      toast.success(`✅ Detected ${detectedCount} fields: ${detectedFields}`)

      // Show transcription in console for debugging
      if (transcription) {
        console.log('Original transcription:', transcription)
      }
    } else {
      toast.warning(`No fields detected from: "${transcription}". Please try speaking more clearly.`)
    }
  }

  const processComprehensiveResponse = async (transcript) => {
    const detected = {}

    console.log('Processing transcript:', transcript) // Debug log

    // Process each field to extract information
    for (const field of voiceFields) {
      const extractedValue = await extractFieldFromTranscript(transcript, field)
      console.log(`Field ${field.field}:`, extractedValue) // Debug log

      if (extractedValue) {
        detected[field.field] = extractedValue

        // Set form value
        setValue(field.field, extractedValue)

        // Show popup for detected answer
        showAnswerDetectedPopup(field.label, extractedValue)
      }
    }

    setDetectedAnswers(detected)

    // Show summary of detected fields with details
    const detectedCount = Object.keys(detected).length
    const detectedFields = Object.keys(detected).map(field => {
      const fieldConfig = voiceFields.find(f => f.field === field)
      return fieldConfig ? fieldConfig.label : field
    }).join(', ')

    if (detectedCount > 0) {
      toast.success(`Detected ${detectedCount} fields: ${detectedFields}`)
    } else {
      toast.warning('No fields detected. Try: "Software Engineer at Google, full-time, technology, I am John, 9876543210"')
    }
  }

  const extractFieldFromTranscript = async (transcript, field) => {
    // Enhanced extraction for Indian English patterns and noise handling
    const lowerTranscript = transcript.toLowerCase()

    // Clean transcript - remove common noise words and filler sounds
    const cleanedTranscript = lowerTranscript
      .replace(/\b(um|uh|ah|er|like|you know|actually|basically|so)\b/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    // Look for field-specific patterns with Indian English variations
    switch (field.field) {
      case 'title':
        // Enhanced job title patterns for Indian English
        const titlePatterns = [
          /(?:job title is|position is|role is|title is|post is|designation is)\s+([^,\.]+)/i,
          /(?:for|as|seeking|applying for|looking for)\s+(?:a\s+|the\s+)?([^,\.]+?)(?:\s+at|\s+in|\s+with|\s+post|\s+position|,|$)/i,
          /(?:i am|i'm)\s+(?:a\s+|an\s+)?([^,\.]+?)(?:\s+at|\s+in|\s+with|,|$)/i,
          /([a-zA-Z\s]+?)(?:\s+at|\s+in)\s+[a-zA-Z\s]+/i, // Extract title before "at company"
          /^([^,\.]+?)(?:\s+at|\s+in|\s+with|\s+for|,)/i, // First phrase before preposition
          /(?:job|position|role)\s+(?:is\s+)?([^,\.]+)/i // Simple job patterns
        ]
        for (const pattern of titlePatterns) {
          const match = cleanedTranscript.match(pattern)
          if (match && match[1] && match[1].trim().length > 2) {
            const title = match[1].trim().replace(/\b(the|a|an|job|position|role)\b/gi, '').trim()
            if (title.length > 1) return title
          }
        }
        break

      case 'company.name':
        // Enhanced company name patterns for Indian English
        const companyPatterns = [
          /(?:company is|company name is|working at|working in|at|with|for)\s+([^,\.]+?)(?:\s+it's|\s+its|\s+the|\s+and|\s+company|,|$)/i,
          /(?:in|at)\s+([A-Z][a-zA-Z\s&]+?)(?:\s+company|\s+limited|\s+ltd|\s+pvt|\s+private|,|$)/i,
          /(?:company|organization|firm)\s+(?:is\s+)?([^,\.]+)/i,
          /(?:at|in|with|for)\s+([A-Z][a-zA-Z\s&\.]+?)(?:\s+company|\s+limited|\s+ltd|\s+pvt|\s+private|\s+technologies|\s+solutions|,|$)/i,
          /(?:from|representing)\s+([A-Z][a-zA-Z\s&\.]+)/i
        ]
        for (const pattern of companyPatterns) {
          const match = cleanedTranscript.match(pattern)
          if (match && match[1] && match[1].trim().length > 1) {
            const company = match[1].trim().replace(/\b(company|limited|ltd|pvt|private|technologies|solutions)\b/gi, '').trim()
            if (company.length > 1) return company
          }
        }
        break

      case 'jobType':
        // Enhanced job type patterns with Indian English variations
        if (/\b(full time|fulltime|full-time|permanent|regular)\b/i.test(cleanedTranscript)) return 'Full-time'
        if (/\b(part time|parttime|part-time|partial)\b/i.test(cleanedTranscript)) return 'Part-time'
        if (/\b(contract|contractual|temporary|temp)\b/i.test(cleanedTranscript)) return 'Contract'
        if (/\b(internship|intern|trainee|apprentice)\b/i.test(cleanedTranscript)) return 'Internship'
        if (/\b(freelance|freelancer|consultant)\b/i.test(cleanedTranscript)) return 'Freelance'
        break

      case 'industry':
        // Enhanced industry recognition with Indian context
        const industryMap = {
          'technology': ['technology', 'tech', 'it', 'software', 'computer', 'digital'],
          'finance': ['finance', 'banking', 'financial', 'bank', 'investment', 'insurance'],
          'healthcare': ['healthcare', 'health', 'medical', 'hospital', 'pharma', 'pharmaceutical'],
          'education': ['education', 'educational', 'teaching', 'school', 'college', 'university'],
          'retail': ['retail', 'shopping', 'ecommerce', 'e-commerce', 'sales'],
          'manufacturing': ['manufacturing', 'production', 'factory', 'industrial', 'automobile', 'auto'],
          'marketing': ['marketing', 'advertising', 'promotion', 'branding'],
          'consulting': ['consulting', 'consultancy', 'advisory', 'services']
        }

        for (const [industry, keywords] of Object.entries(industryMap)) {
          for (const keyword of keywords) {
            if (cleanedTranscript.includes(keyword)) {
              return industry.charAt(0).toUpperCase() + industry.slice(1)
            }
          }
        }
        break

      case 'contactPerson.name':
        // Enhanced name patterns for Indian names
        const namePatterns = [
          /(?:my name is|i am|i'm|name is|myself)\s+([^,\.]+?)(?:\s+and|\s+my|\s+from|,|$)/i,
          /(?:contact person is|recruiter is|hr is)\s+([^,\.]+)/i,
          /(?:this is|speaking)\s+([^,\.]+?)(?:\s+from|\s+calling|,|$)/i,
          /(?:i'm|i am)\s+([A-Z][a-zA-Z\s]+?)(?:\s+from|\s+and|\s+calling|,|$)/i,
          /(?:contact|call|reach)\s+([A-Z][a-zA-Z\s]+?)(?:\s+at|\s+on|,|$)/i
        ]
        for (const pattern of namePatterns) {
          const match = cleanedTranscript.match(pattern)
          if (match && match[1] && match[1].trim().length > 1) {
            const name = match[1].trim().replace(/\b(sir|madam|ji|sahib|mister|mr|mrs|ms)\b/gi, '').trim()
            if (name.length > 1) return name
          }
        }
        break

      case 'contactPerson.phone':
        // Enhanced phone number patterns for Indian numbers
        const phonePatterns = [
          /(\+91[-.\s]?\d{10})/g, // Indian format with +91
          /(\d{10})/g, // 10-digit Indian mobile
          /(\+?\d{1,3}[-.\s]?\d{3,4}[-.\s]?\d{3,4}[-.\s]?\d{3,4})/g, // International format
          /(?:number is|contact is|phone is|mobile is)\s*(\+?\d[\d\s\-\.]{8,15})/i
        ]
        for (const pattern of phonePatterns) {
          const phoneMatch = cleanedTranscript.match(pattern)
          if (phoneMatch) {
            let phone = phoneMatch[1].replace(/[^\d\+]/g, '')
            if (phone.length === 10 && !phone.startsWith('+')) {
              phone = '+91' + phone // Add Indian country code
            }
            return phone
          }
        }
        break
    }

    return null
  }

  const showAnswerDetectedPopup = (fieldLabel, value) => {
    setShowAnswerPopup({ field: fieldLabel, value })
    setTimeout(() => setShowAnswerPopup(null), 3000)
  }

  const speakPrompt = (text) => {
    return new Promise((resolve) => {
      setIsSpeaking(true)
      const utterance = new SpeechSynthesisUtterance(text)

      // Configure voice settings for professional male voice
      const voices = speechSynthesis.getVoices()
      const maleVoice = voices.find(voice =>
        voice.name.includes('Male') ||
        voice.name.includes('David') ||
        voice.name.includes('Mark') ||
        voice.lang.includes('en-US')
      )

      if (maleVoice) utterance.voice = maleVoice
      utterance.rate = 0.9
      utterance.pitch = 0.8
      utterance.volume = 0.8

      utterance.onend = () => {
        setIsSpeaking(false)
        resolve()
      }

      speechSynthesis.speak(utterance)
    })
  }



  const stopVoiceEntry = () => {
    // Stop recording if active
    stopRecording()

    // Reset all states
    setIsVoiceActive(false)
    setIsRecording(false)
    setIsProcessing(false)
    setVoiceProgress(0)
    setRecordingTime(0)

    // Clear intervals
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current)
    }

    toast.info('Voice entry stopped')
  }

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      const jobData = {
        ...data,
        responsibilities: responsibilities.filter(item => item.trim()),
        benefits: benefits.filter(item => item.trim()),
        requirements: {
          ...data.requirements,
          skills: requiredSkills.filter(skill => skill.trim())
        },
        salary: {
          ...data.salary,
          currency: 'INR' // Always use INR (Rupees)
        }
      }

      const response = await jobAPI.createJob(jobData)
      toast.success('Job posted successfully!')
      
      // Navigate to QR preview page
      navigate(`/qr-preview/${response.data.job.jobId}`)
    } catch (error) {
      console.error('Job posting error:', error)
      if (error.response?.data?.details) {
        const errorMessages = error.response.data.details.map(detail => detail.msg).join(', ')
        toast.error(`Validation failed: ${errorMessages}`)
      } else {
        toast.error(error.response?.data?.error || 'Failed to post job')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePreview = () => {
    const formData = getValues()
    console.log('Raw form data:', formData) // Debug log

    // Validate only basic information fields
    const requiredFields = {
      title: formData.title,
      'company.name': formData.company?.name,
      industry: formData.industry,
      jobType: formData.jobType,
      'contactPerson.name': formData.contactPerson?.name,
      'contactPerson.phone': formData.contactPerson?.phone
    }

    const missingFields = []
    Object.entries(requiredFields).forEach(([key, value]) => {
      if (!value || value.trim() === '') {
        missingFields.push(key.replace('.', ' ').replace(/([A-Z])/g, ' $1').toLowerCase())
      }
    })

    if (missingFields.length > 0) {
      toast.error(`Please fill in the following required fields: ${missingFields.join(', ')}`)
      return
    }

    const previewJobData = {
      ...formData,
      responsibilities: responsibilities.filter(item => item.trim()),
      benefits: benefits.filter(item => item.trim()),
      requirements: {
        ...formData.requirements,
        skills: requiredSkills.filter(skill => skill.trim())
      },
      salary: {
        ...formData.salary,
        currency: 'INR'
      }
    }
    console.log('Preview job data:', previewJobData) // Debug log
    setPreviewData(previewJobData)
    setShowPreview(true)
  }

  const handleEdit = () => {
    setShowPreview(false)
  }

  const handlePostJob = async () => {
    if (!previewData) return
    
    setIsSubmitting(true)
    try {
      console.log('Submitting job data:', previewData) // Debug log
      const response = await jobAPI.createJob(previewData)
      toast.success('Job posted successfully!')
      navigate(`/qr-preview/${response.data.job.jobId}`)
    } catch (error) {
      console.error('Job posting error:', error)
      console.error('Error response:', error.response?.data) // Debug log
      if (error.response?.data?.details) {
        const errorMessages = error.response.data.details.map(detail => detail.msg).join(', ')
        toast.error(`Validation failed: ${errorMessages}`)
      } else {
        toast.error(error.response?.data?.error || 'Failed to post job')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const addItem = (list, setList) => {
    setList([...list, ''])
  }

  const removeItem = (list, setList, index) => {
    const newList = list.filter((_, i) => i !== index)
    setList(newList)
  }

  const updateItem = (list, setList, index, value) => {
    const newList = [...list]
    newList[index] = value
    setList(newList)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0)
  }

  if (showPreview && previewData) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1
            className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2"
            style={{
              animation: 'jobTitlePop 1.2s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards',
              transformStyle: 'preserve-3d',
              textShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }}
          >
            Job Preview
          </h1>
          <p className="text-gray-600 dark:text-gray-300">Review your job posting before publishing</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-8 text-white relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>

            <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-4 sm:mb-0">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">{previewData.title}</h2>
                <p className="text-purple-100 text-lg">{previewData.company?.name}</p>
              </div>
              <div className="text-left sm:text-right">
                <span className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-2">
                  {previewData.jobType}
                </span>
                <div className="mt-2 text-blue-100 text-sm">
                  {previewData.location?.type === 'Remote' ? '🌐 Remote' : 
                   previewData.location?.type === 'Hybrid' ? '🏢 Hybrid' : '🏢 On-site'}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8 space-y-8">
            {/* Basic Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 transition-colors duration-300">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Building className="w-5 h-5 mr-2 text-purple-600" />
                  Job Details
                </h3>
                <div className="space-y-3 text-sm">
                   <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                     <span className="text-gray-600 dark:text-gray-400">Industry:</span>
                     <span className="font-medium text-gray-900 dark:text-white">{previewData.industry}</span>
                   </div>
                   <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                     <span className="text-gray-600 dark:text-gray-400">Location:</span>
                     <span className="font-medium text-gray-900 dark:text-white">
                       {previewData.location?.type === 'Remote' ? 'Remote' :
                        `${previewData.location?.city || ''}, ${previewData.location?.state || ''}, ${previewData.location?.country || ''}`}
                     </span>
                   </div>
                   {previewData.salary?.min && (
                     <div className="flex justify-between items-center">
                       <span className="text-gray-600">Salary:</span>
                       <span className="font-medium">
                         {formatCurrency(previewData.salary.min)} - {formatCurrency(previewData.salary.max)} {previewData.salary?.period}
                       </span>
                     </div>
                   )}
                                       <div className="flex justify-between items-center">
                      <span className="text-gray-600">Job ID:</span>
                      <span className="font-medium font-mono text-gray-500">Will be generated after posting</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Contact Person:</span>
                      <span className="font-medium">{previewData.contactPerson?.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Contact Phone:</span>
                      <span className="font-medium">{previewData.contactPerson?.phone}</span>
                    </div>
                 </div>
              </div>

                             <div>
                 <h3 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h3>
                 <div className="space-y-2 text-sm">
                   <div className="flex justify-between items-center">
                     <span className="text-gray-600">Education:</span>
                     <span className="font-medium">{previewData.requirements?.education}</span>
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="text-gray-600">Experience:</span>
                     <span className="font-medium">{previewData.requirements?.experience?.min || 0} years</span>
                   </div>
                 </div>
               </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Job Description</h3>
              <p className="text-gray-700 leading-relaxed">{previewData.description}</p>
            </div>

            {/* Skills */}
            {previewData.requirements?.skills?.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {previewData.requirements.skills.map((skill, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Responsibilities */}
            {previewData.responsibilities?.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Responsibilities</h3>
                <ul className="space-y-2">
                  {previewData.responsibilities.map((responsibility, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span className="text-gray-700">{responsibility}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Benefits */}
            {previewData.benefits?.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Benefits</h3>
                <ul className="space-y-2">
                  {previewData.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
            <button
              type="button"
              onClick={handleEdit}
              className="btn-outline flex items-center"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Job
            </button>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="btn-outline"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePostJob}
                disabled={isSubmitting}
                className="btn-primary flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Post Job
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center shadow-lg">
            <Building className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1
          className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2"
          style={{
            animation: 'jobTitlePop 1.2s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards',
            transformStyle: 'preserve-3d',
            textShadow: '0 4px 8px rgba(0,0,0,0.1)'
          }}
        >
          Post Your Opportunities
        </h1>
        <p className="text-gray-600 dark:text-gray-300">Create a new job posting to reach qualified candidates</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handlePreview(); }} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold flex items-center text-gray-900 dark:text-white">
              <Building className="w-5 h-5 mr-2 text-blue-600" />
              Basic Information
            </h2>

            {/* Voice Entry Button */}
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
              {(isRecording || isProcessingVoice) && (
                <div className="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  <div className="relative">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-ping"></div>
                  </div>
                  <span className="font-medium hidden sm:inline">
                    {isRecording ? 'Recording...' : isProcessingVoice ? 'Processing with AI...' : 'Ready'}
                  </span>
                  <span className="font-medium sm:hidden">
                    {isRecording ? '🎤' : isProcessingVoice ? '🤖' : '⚡'}
                  </span>
                </div>
              )}

              {/* 3D Voice Input Button */}
              <div className="relative">
                {/* Sound waves animation when active */}
                {isRecording && (
                  <div className="absolute -left-8 top-1/2 transform -translate-y-1/2">
                    <Volume2 className="w-5 h-5 text-purple-500 animate-pulse" />
                    <div className="absolute -inset-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-ping absolute top-2" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-ping absolute top-4" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    if (isRecording) {
                      stopVoiceRecording()
                    } else {
                      startVoiceRecording()
                    }
                  }}
                  disabled={isProcessingVoice}
                  className={`group relative flex items-center space-x-2 sm:space-x-3 px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 transform-gpu touch-manipulation ${
                    isRecording
                      ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl voice-button-active'
                      : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-2xl voice-button-inactive'
                  } ${isProcessingVoice ? 'opacity-50 cursor-not-allowed' : ''}`}
                  style={{
                    transformStyle: 'preserve-3d',
                    perspective: '1000px',
                    boxShadow: isRecording
                      ? '0 8px 25px rgba(239, 68, 68, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 0 15px rgba(239, 68, 68, 0.2)'
                      : '0 8px 25px rgba(139, 92, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 0 15px rgba(139, 92, 246, 0.1)',
                    minHeight: '44px' // iOS touch target minimum
                  }}
                  disabled={isSubmitting}
                >
                  {/* 3D Button Background Effect */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/20 to-transparent opacity-50"></div>

                  {/* Icon with 3D effect */}
                  <div className={`relative transform transition-all duration-300 ${
                    isRecording ? 'mic-icon-active scale-110' : 'group-hover:scale-110 group-hover:rotate-3'
                  }`}>
                    {isRecording ? (
                      <MicOff className="w-4 h-4 sm:w-5 sm:h-5 drop-shadow-lg filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]" />
                    ) : (
                      <Mic className="w-4 h-4 sm:w-5 sm:h-5 drop-shadow-lg filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]" />
                    )}
                  </div>

                  {/* Text with 3D effect - responsive */}
                  <span className="relative z-10 drop-shadow-sm hidden sm:inline">
                    {isRecording ? 'Stop Recording' : isProcessingVoice ? 'Processing...' : 'Voice Input'}
                  </span>
                  <span className="relative z-10 drop-shadow-sm sm:hidden">
                    {isRecording ? 'Stop' : isProcessingVoice ? '...' : 'Voice'}
                  </span>

                  {/* Animated border glow */}
                  <div className={`absolute inset-0 rounded-xl transition-opacity duration-300 ${
                    isRecording
                      ? 'bg-gradient-to-r from-red-400 to-red-500 opacity-75 animate-pulse'
                      : 'bg-gradient-to-r from-purple-400 to-purple-500 opacity-0 group-hover:opacity-50'
                  }`} style={{ filter: 'blur(8px)', zIndex: -1 }}></div>
                </button>
              </div>
            </div>
          </div>

          {/* Voice Input Example */}
          {!isRecording && !isProcessingVoice && (
            <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
              <p className="text-sm text-purple-800 dark:text-purple-200">
                <strong>🎤 AI Voice Input:</strong> "Software Engineer at Google, full-time, technology, I am John Smith, 9876543210"
              </p>
              <p className="text-xs text-purple-600 dark:text-purple-300 mt-1">
                Powered by OpenAI Whisper for accurate speech recognition
              </p>
            </div>
          )}

          {/* Voice Progress Indicator */}
          {(isRecording || isProcessingVoice) && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Voice Entry Progress
                </span>
                <span className="text-xs text-blue-600 dark:text-blue-300">
                  {currentVoiceField !== null ? `Field ${currentVoiceField + 1} of ${voiceFields.length}` : 'Initializing...'}
                </span>
              </div>
              <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                <div
                  className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${voiceProgress}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {isRecording ? `Recording: ${recordingTime}/15 seconds` :
                   isProcessing ? 'Processing with OpenAI...' :
                   'Voice input active'}
                </p>
                {isRecording && (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                  >
                    Stop Recording
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div className="form-group relative">
              <label className="form-label">Job Title *</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g., AI Engineer"
                {...register('title', { required: 'Job title is required' })}
                onChange={handleJobTitleChange}
                onKeyDown={handleJobTitleKeyDown}
                onBlur={handleJobTitleBlur}
                autoComplete="off"
              />
              {errors.title && <p className="form-error">{errors.title.message}</p>}

              {/* Job Title Autocomplete Suggestions */}
              {showJobTitleSuggestions && (
                <div
                  className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-2xl max-h-48 overflow-y-auto"
                  style={{
                    animation: 'dropdownSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards',
                    transformOrigin: 'top',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(147, 51, 234, 0.1)',
                    backdropFilter: 'blur(8px)',
                    transform: 'translateZ(0)'
                  }}
                >
                  {jobTitleSuggestions.map((title, index) => (
                    <div
                      key={index}
                      className={`px-4 py-3 cursor-pointer text-sm border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-all duration-200 job-title-dropdown-item ${
                        index === selectedSuggestionIndex
                          ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-900 dark:text-purple-100'
                          : 'hover:bg-purple-50 dark:hover:bg-purple-900/20 text-gray-900 dark:text-white'
                      }`}
                      onClick={() => selectJobTitle(title)}
                      onMouseEnter={() => setSelectedSuggestionIndex(index)}
                      style={{
                        animation: `dropdownItemSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.05}s forwards`,
                        opacity: 0,
                        transform: 'translateY(-10px)'
                      }}
                    >
                      <span className="font-medium">{title}</span>
                      {index === 0 && selectedSuggestionIndex === -1 && (
                        <span className="ml-2 text-xs text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded-full">(Press Tab)</span>
                      )}
                      {index === selectedSuggestionIndex && (
                        <span className="ml-2 text-xs text-purple-600 dark:text-purple-400 bg-purple-200 dark:bg-purple-800/50 px-2 py-1 rounded-full">Selected</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Company Name *</label>
              <input
                type="text"
                className="input-field"
                placeholder="Your company name"
                {...register('company.name', { required: 'Company name is required' })}
              />
              {errors.company?.name && <p className="form-error">{errors.company.name.message}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Industry *</label>
              <select className="input-field" {...register('industry', { required: 'Industry is required' })}>
                <option value="">Select Industry</option>
                <option value="Technology">Technology</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Finance">Finance</option>
                <option value="Education">Education</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Retail">Retail</option>
                <option value="Other">Other</option>
              </select>
              {errors.industry && <p className="form-error">{errors.industry.message}</p>}
            </div>

                         <div className="form-group">
               <label className="form-label">Job Type *</label>
               <select className="input-field" {...register('jobType', { required: 'Job type is required' })}>
                 <option value="">Select Job Type</option>
                 <option value="Full-time">Full-time</option>
                 <option value="Part-time">Part-time</option>
                 <option value="Contract">Contract</option>
                 <option value="Internship">Internship</option>
                 <option value="Freelance">Freelance</option>
               </select>
               {errors.jobType && <p className="form-error">{errors.jobType.message}</p>}
             </div>

             <div className="form-group">
               <label className="form-label">Contact Person Name *</label>
               <input
                 type="text"
                 className="input-field"
                 placeholder="e.g., John Doe"
                 {...register('contactPerson.name', { required: 'Contact person name is required' })}
               />
               {errors.contactPerson?.name && <p className="form-error">{errors.contactPerson.name.message}</p>}
             </div>

             <div className="form-group">
               <label className="form-label">Contact Person Phone *</label>
               <input
                 type="tel"
                 className="input-field"
                 placeholder="e.g., +91 98765 43210"
                 {...register('contactPerson.phone', { required: 'Contact person phone is required' })}
               />
               {errors.contactPerson?.phone && <p className="form-error">{errors.contactPerson.phone.message}</p>}
             </div>
          </div>

          <div className="form-group mt-6">
            <label className="form-label">Job Description</label>
            <textarea
              className="input-field"
              rows="6"
              placeholder="Describe the role, responsibilities, and what makes this position exciting..."
              {...register('description')}
            />
            {errors.description && <p className="form-error">{errors.description.message}</p>}
          </div>
        </div>

        {/* Location & Salary - Collapsible */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <button
            type="button"
            onClick={() => toggleOptionalField('location')}
            className="dropdown-button w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 rounded-xl"
          >
            <h2 className="text-xl font-semibold flex items-center text-gray-900 dark:text-white">
              <MapPin className="w-5 h-5 mr-2 text-blue-600" />
              Location & Salary
              <span className="text-gray-500 text-sm font-normal ml-2">(Optional)</span>
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {expandedOptionalFields.location ? 'Hide' : 'Add Location & Salary'}
              </span>
              <div className={`dropdown-arrow ${expandedOptionalFields.location ? 'rotate-180' : ''}`}>
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </button>

          {expandedOptionalFields.location && (
            <div
              className="dropdown-content overflow-hidden border-t border-gray-100 dark:border-gray-700"
              style={{
                animation: 'slideDown 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards',
                transformOrigin: 'top'
              }}
            >
              <div
                className="px-6 pb-6 pt-6"
                style={{
                  animation: 'fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.1s both'
                }}
              >
                <div className="grid md:grid-cols-2 gap-6">
            <div className="form-group">
              <label className="form-label">Location Type</label>
              <select className="input-field" {...register('location.type')}>
                <option value="">Select Location Type</option>
                <option value="Remote">Remote</option>
                <option value="On-site">On-site</option>
                <option value="Hybrid">Hybrid</option>
              </select>
              {errors.location?.type && <p className="form-error">{errors.location.type.message}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">City</label>
              <input
                type="text"
                className={`input-field ${locationType === 'Remote' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                placeholder="e.g., Mumbai"
                disabled={locationType === 'Remote'}
                {...register('location.city')}
              />
            </div>

            <div className="form-group">
              <label className="form-label">State</label>
              <input
                type="text"
                className={`input-field ${locationType === 'Remote' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                placeholder="e.g., Maharashtra"
                disabled={locationType === 'Remote'}
                {...register('location.state')}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Country</label>
              <input
                type="text"
                className={`input-field ${locationType === 'Remote' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                placeholder="e.g., India"
                disabled={locationType === 'Remote'}
                {...register('location.country')}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-6">
            <div className="form-group">
              <label className="form-label">Minimum Salary (₹)</label>
              <input
                type="number"
                className="input-field"
                placeholder="500000"
                {...register('salary.min', { min: 0 })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Maximum Salary (₹)</label>
              <input
                type="number"
                className="input-field"
                placeholder="800000"
                {...register('salary.max', { min: 0 })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Salary Period</label>
              <select className="input-field" {...register('salary.period')}>
                <option value="Yearly">Yearly</option>
                <option value="Monthly">Monthly</option>
                <option value="Hourly">Hourly</option>
              </select>
            </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Requirements - Collapsible */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <button
            type="button"
            onClick={() => toggleOptionalField('requirements')}
            className="dropdown-button w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 rounded-xl"
          >
            <h2 className="text-xl font-semibold flex items-center text-gray-900 dark:text-white">
              <Users className="w-5 h-5 mr-2 text-blue-600" />
              Requirements
              <span className="text-gray-500 text-sm font-normal ml-2">(Optional)</span>
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {expandedOptionalFields.requirements ? 'Hide' : 'Add Requirements'}
              </span>
              <div className={`dropdown-arrow ${expandedOptionalFields.requirements ? 'rotate-180' : ''}`}>
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </button>

          {expandedOptionalFields.requirements && (
            <div
              className="dropdown-content overflow-hidden border-t border-gray-100 dark:border-gray-700"
              style={{
                animation: 'slideDown 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards',
                transformOrigin: 'top'
              }}
            >
              <div
                className="px-6 pb-6 pt-6"
                style={{
                  animation: 'fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.1s both'
                }}
              >
                <div className="grid md:grid-cols-2 gap-6">
            <div className="form-group">
              <label className="form-label">Education Level</label>
              <select className="input-field" {...register('requirements.education')}>
                <option value="">Select Education</option>
                <option value="High School">High School</option>
                <option value="Bachelor">Bachelor's Degree</option>
                <option value="Master">Master's Degree</option>
                <option value="PhD">PhD</option>
                <option value="Diploma">Diploma</option>
                <option value="Any">Any</option>
              </select>
              {errors.requirements?.education && <p className="form-error">{errors.requirements.education.message}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Minimum Experience (Years)</label>
              <input
                type="number"
                className="input-field"
                min="0"
                placeholder="2"
                {...register('requirements.experience.min', { min: 0 })}
              />
            </div>
          </div>

          <div className="form-group mt-6">
            <label className="form-label">Required Skills</label>
            <div className="space-y-2">
              {requiredSkills.map((skill, index) => (
                <div key={index} className="flex space-x-2">
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g., JavaScript, React"
                    value={skill}
                    onChange={(e) => updateItem(requiredSkills, setRequiredSkills, index, e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(requiredSkills, setRequiredSkills, index)}
                    className="px-3 py-2 text-red-600 hover:text-red-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addItem(requiredSkills, setRequiredSkills)}
                className="btn-outline text-sm flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Skill
              </button>
            </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Responsibilities - Collapsible */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <button
            type="button"
            onClick={() => toggleOptionalField('responsibilities')}
            className="dropdown-button w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 rounded-xl"
          >
            <h2 className="text-xl font-semibold flex items-center text-gray-900 dark:text-white">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              Responsibilities
              <span className="text-gray-500 text-sm font-normal ml-2">(Optional)</span>
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {expandedOptionalFields.responsibilities ? 'Hide' : 'Add Responsibilities'}
              </span>
              <div className={`dropdown-arrow ${expandedOptionalFields.responsibilities ? 'rotate-180' : ''}`}>
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </button>

          {expandedOptionalFields.responsibilities && (
            <div
              className="dropdown-content overflow-hidden border-t border-gray-100 dark:border-gray-700"
              style={{
                animation: 'slideDown 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards',
                transformOrigin: 'top'
              }}
            >
              <div
                className="px-6 pb-6 pt-6"
                style={{
                  animation: 'fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.1s both'
                }}
              >
                <div className="space-y-2">
            {responsibilities.map((responsibility, index) => (
              <div key={index} className="flex space-x-2">
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g., Develop and maintain web applications"
                  value={responsibility}
                  onChange={(e) => updateItem(responsibilities, setResponsibilities, index, e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeItem(responsibilities, setResponsibilities, index)}
                  className="px-3 py-2 text-red-600 hover:text-red-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addItem(responsibilities, setResponsibilities)}
              className="btn-outline text-sm flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Responsibility
            </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Benefits - Collapsible */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <button
            type="button"
            onClick={() => toggleOptionalField('benefits')}
            className="dropdown-button w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 rounded-xl"
          >
            <h2 className="text-xl font-semibold flex items-center text-gray-900 dark:text-white">
              <DollarSign className="w-5 h-5 mr-2 text-blue-600" />
              Benefits
              <span className="text-gray-500 text-sm font-normal ml-2">(Optional)</span>
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {expandedOptionalFields.benefits ? 'Hide' : 'Add Benefits'}
              </span>
              <div className={`dropdown-arrow ${expandedOptionalFields.benefits ? 'rotate-180' : ''}`}>
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </button>

          {expandedOptionalFields.benefits && (
            <div
              className="dropdown-content overflow-hidden border-t border-gray-100 dark:border-gray-700"
              style={{
                animation: 'slideDown 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards',
                transformOrigin: 'top'
              }}
            >
              <div
                className="px-6 pb-6 pt-6"
                style={{
                  animation: 'fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.1s both'
                }}
              >
                <div className="space-y-2">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex space-x-2">
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g., Health insurance, Flexible hours"
                  value={benefit}
                  onChange={(e) => updateItem(benefits, setBenefits, index, e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeItem(benefits, setBenefits, index)}
                  className="px-3 py-2 text-red-600 hover:text-red-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addItem(benefits, setBenefits)}
              className="btn-outline text-sm flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Benefit
            </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="btn-primary text-lg px-8 py-3 flex items-center"
          >
            <Eye className="w-5 h-5 mr-2" />
            Preview Job
          </button>
        </div>
      </form>

      {/* Answer Detection Popup */}
      {showAnswerPopup && (
        <div className="fixed top-1/2 right-8 transform -translate-y-1/2 z-50">
          <div
            className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-2xl border-l-4 border-green-300 max-w-sm"
            style={{
              animation: 'slideInRight 0.3s ease-out forwards'
            }}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                  <span className="text-green-800 text-sm font-bold">✓</span>
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">Detected: {showAnswerPopup.field}</h4>
                <p className="text-green-100 text-sm break-words">{showAnswerPopup.value}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default JobPostingForm 