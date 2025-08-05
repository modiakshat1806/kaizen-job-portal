import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Building, MapPin, DollarSign, Users, FileText, Plus, X, Eye, Edit, Trash2, Download, Share2, ChevronDown, Mic, MicOff, Volume2 } from 'lucide-react'
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

      /* Enhanced mobile responsiveness for voice button */
      @media (max-width: 640px) {
        .voice-button-active,
        .voice-button-inactive {
          min-height: 44px;
          min-width: 44px;
        }
      }

      /* 3D Preview Animations */
      @keyframes cardFloat {
        0%, 100% { transform: translateY(0px) rotateY(0deg); }
        50% { transform: translateY(-3px) rotateY(1deg); }
      }

      @keyframes skillPulse {
        0%, 100% { transform: scale(1) rotateZ(0deg); }
        50% { transform: scale(1.05) rotateZ(1deg); }
      }

      @keyframes benefitGlow {
        0%, 100% { box-shadow: 0 0 5px rgba(168, 85, 247, 0.3); }
        50% { box-shadow: 0 0 15px rgba(168, 85, 247, 0.6); }
      }

      .preview-card-3d {
        transform-style: preserve-3d;
        animation: cardFloat 4s ease-in-out infinite;
      }

      .skill-badge-3d {
        animation: skillPulse 2s ease-in-out infinite;
        animation-delay: calc(var(--delay) * 0.2s);
      }

      .benefit-item-3d {
        animation: benefitGlow 3s ease-in-out infinite;
        animation-delay: calc(var(--delay) * 0.3s);
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



  const { register, handleSubmit, formState: { errors }, watch, setValue, getValues } = useForm()

  // Watch location type to disable location fields for remote jobs
  const locationType = watch('location.type')





  // Optional fields dropdown states - all closed by default
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

  // Voice functionality state
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessingVoice, setIsProcessingVoice] = useState(false)
  const [voiceProgress, setVoiceProgress] = useState(0)
  const [recordingTime, setRecordingTime] = useState(0)
  const [showAnswerPopup, setShowAnswerPopup] = useState(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const streamRef = useRef(null)
  const recordingIntervalRef = useRef(null)

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
      setVoiceProgress(10)
      setRecordingTime(0)
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
      setVoiceProgress(25)
      toast.success('🎤 Recording started! Speak your job details clearly.')

      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1
          if (newTime >= 30) { // Auto-stop after 30 seconds
            stopVoiceRecording()
          }
          return newTime
        })
      }, 1000)

    } catch (error) {
      console.error('Voice recording error:', error)
      setIsRecording(false)
      setVoiceProgress(0)

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
      setVoiceProgress(50)
      toast.info('Processing your voice input...')
    }
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current)
    }
  }

  const processVoiceInput = async (audioBlob) => {
    try {
      setIsProcessingVoice(true)
      setVoiceProgress(60)

      // Step 1: Transcribe audio using Whisper
      const transcriptionResponse = await voiceAPI.transcribe(audioBlob)
      const transcript = transcriptionResponse.data.transcript

      console.log('Transcription:', transcript)
      setVoiceProgress(80)
      toast.success('Voice transcribed successfully!')

      // Step 2: Extract fields from transcript for job posting
      const extractionResponse = await voiceAPI.extractFields(transcript, 'job_posting')
      const extractedFields = extractionResponse.data.extractedFields

      console.log('Extracted fields:', extractedFields)
      setVoiceProgress(90)

      // Step 3: Populate form fields with smart mapping
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

      // Smart mapping for Industry
      if (extractedFields.industry) {
        const industryMapping = {
          // Technology variations
          'technology': 'Technology',
          'tech': 'Technology',
          'it': 'Technology',
          'software': 'Technology',
          'industrial technology': 'Technology',
          'information technology': 'Technology',
          'computer': 'Technology',
          'digital': 'Technology',

          // Healthcare variations
          'healthcare': 'Healthcare',
          'health': 'Healthcare',
          'medical': 'Healthcare',
          'pharma': 'Healthcare',
          'pharmaceutical': 'Healthcare',

          // Finance variations
          'finance': 'Finance',
          'financial': 'Finance',
          'banking': 'Finance',
          'fintech': 'Finance',

          // Education variations
          'education': 'Education',
          'educational': 'Education',
          'teaching': 'Education',
          'academic': 'Education',

          // Other industries
          'retail': 'Retail',
          'sales': 'Retail',
          'manufacturing': 'Manufacturing',
          'production': 'Manufacturing',
          'consulting': 'Consulting',
          'marketing': 'Marketing',
          'advertising': 'Marketing',
          'government': 'Government',
          'public': 'Government',
          'nonprofit': 'Non-profit',
          'ngo': 'Non-profit',
          'non-profit': 'Non-profit'
        }

        const normalizedIndustry = extractedFields.industry.toLowerCase().trim()
        let mappedIndustry = industryMapping[normalizedIndustry]

        // If no exact match, check if it contains key words
        if (!mappedIndustry) {
          if (normalizedIndustry.includes('tech') || normalizedIndustry.includes('software') || normalizedIndustry.includes('it') || normalizedIndustry.includes('computer')) {
            mappedIndustry = 'Technology'
          } else if (normalizedIndustry.includes('health') || normalizedIndustry.includes('medical')) {
            mappedIndustry = 'Healthcare'
          } else if (normalizedIndustry.includes('finance') || normalizedIndustry.includes('bank')) {
            mappedIndustry = 'Finance'
          } else if (normalizedIndustry.includes('education') || normalizedIndustry.includes('teach')) {
            mappedIndustry = 'Education'
          } else {
            // If still no match, use the original value (might be already correct)
            mappedIndustry = extractedFields.industry
          }
        }

        setValue('industry', mappedIndustry)
        fieldsPopulated++
        console.log('Industry mapped:', extractedFields.industry, '->', mappedIndustry)
      }

      // Smart mapping for Job Type
      if (extractedFields.jobType) {
        const jobTypeMapping = {
          // Full-time variations
          'full-time': 'Full-time',
          'fulltime': 'Full-time',
          'full time': 'Full-time',
          'permanent': 'Full-time',
          'regular': 'Full-time',

          // Part-time variations
          'part-time': 'Part-time',
          'parttime': 'Part-time',
          'part time': 'Part-time',
          'partial': 'Part-time',

          // Contract variations
          'contract': 'Contract',
          'contractual': 'Contract',
          'temporary': 'Contract',
          'temp': 'Contract',
          'consultant': 'Contract',

          // Internship variations
          'internship': 'Internship',
          'intern': 'Internship',
          'trainee': 'Internship',
          'apprentice': 'Internship',
          'student': 'Internship',

          // Freelance variations
          'freelance': 'Freelance',
          'freelancer': 'Freelance',
          'independent': 'Freelance'
        }

        const normalizedJobType = extractedFields.jobType.toLowerCase().trim()
        let mappedJobType = jobTypeMapping[normalizedJobType]

        // If no exact match, check if it contains key words
        if (!mappedJobType) {
          if (normalizedJobType.includes('full') || normalizedJobType.includes('permanent')) {
            mappedJobType = 'Full-time'
          } else if (normalizedJobType.includes('part')) {
            mappedJobType = 'Part-time'
          } else if (normalizedJobType.includes('intern') || normalizedJobType.includes('trainee')) {
            mappedJobType = 'Internship'
          } else if (normalizedJobType.includes('contract') || normalizedJobType.includes('temp')) {
            mappedJobType = 'Contract'
          } else if (normalizedJobType.includes('freelance')) {
            mappedJobType = 'Freelance'
          } else {
            // If still no match, use the original value (might be already correct)
            mappedJobType = extractedFields.jobType
          }
        }

        setValue('jobType', mappedJobType)
        fieldsPopulated++
        console.log('Job Type mapped:', extractedFields.jobType, '->', mappedJobType)
      }

      if (extractedFields.contactName) {
        setValue('contactPerson.name', extractedFields.contactName)
        fieldsPopulated++
      }
      if (extractedFields.contactPhone) {
        setValue('contactPerson.phone', extractedFields.contactPhone)
        fieldsPopulated++
      }

      setVoiceProgress(100)
      toast.success(`🎉 ${fieldsPopulated} form fields populated from voice input!`)

      // Reset progress after a delay
      setTimeout(() => {
        setVoiceProgress(0)
        setRecordingTime(0)
      }, 2000)

    } catch (error) {
      console.error('Voice processing error:', error)
      toast.error('Failed to process voice input. Please try again.')
      setVoiceProgress(0)
    } finally {
      setIsProcessingVoice(false)
    }
  }

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      // Helper function to clean empty strings and undefined values
      const cleanValue = (value) => {
        if (value === '' || value === undefined || value === null) return undefined
        if (typeof value === 'string') return value.trim() || undefined
        return value
      }

      // Clean and prepare job data
      const jobData = {
        // Required fields
        title: cleanValue(data.title),
        company: {
          name: cleanValue(data.company?.name),
          description: cleanValue(data.company?.description),
          website: cleanValue(data.company?.website)
        },
        contactPerson: {
          name: cleanValue(data.contactPerson?.name),
          phone: cleanValue(data.contactPerson?.phone)
        },
        description: cleanValue(data.description),

        // Optional fields - only include if they have values
        responsibilities: responsibilities.filter(item => item.trim()),
        benefits: benefits.filter(item => item.trim()),
        requirements: {
          education: cleanValue(data.requirements?.education),
          skills: requiredSkills.filter(skill => skill.trim()),
          certifications: data.requirements?.certifications?.filter(cert => cert.trim()) || []
        }
      }

      // Only include optional fields if they have meaningful values
      if (cleanValue(data.jobType)) {
        jobData.jobType = cleanValue(data.jobType)
      }

      if (cleanValue(data.industry)) {
        jobData.industry = cleanValue(data.industry)
      }

      if (cleanValue(data.department)) {
        jobData.department = cleanValue(data.department)
      }

      // Only include salary if min or max is provided and not empty
      if ((data.salary?.min && data.salary.min > 0) || (data.salary?.max && data.salary.max > 0)) {
        jobData.salary = {
          min: data.salary?.min || undefined,
          max: data.salary?.max || undefined,
          currency: 'INR',
          period: cleanValue(data.salary?.period) || 'Yearly'
        }
      }

      // Only include location details if any location field is provided
      const hasLocationData = data.location?.type || data.location?.city || data.location?.state || data.location?.country
      if (hasLocationData) {
        jobData.location = {
          type: cleanValue(data.location?.type),
          city: cleanValue(data.location?.city),
          state: cleanValue(data.location?.state),
          country: cleanValue(data.location?.country),
          address: cleanValue(data.location?.address)
        }
      }

      // Only include application deadline if provided
      if (data.applicationDeadline) {
        jobData.applicationDeadline = data.applicationDeadline
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

    // Helper function to clean empty strings and undefined values
    const cleanValue = (value) => {
      if (value === '' || value === undefined || value === null) return undefined
      if (typeof value === 'string') return value.trim() || undefined
      return value
    }

    // Clean and prepare preview data using the same logic as onSubmit
    const previewJobData = {
      // Required fields
      title: cleanValue(formData.title),
      company: {
        name: cleanValue(formData.company?.name),
        description: cleanValue(formData.company?.description),
        website: cleanValue(formData.company?.website)
      },
      contactPerson: {
        name: cleanValue(formData.contactPerson?.name),
        phone: cleanValue(formData.contactPerson?.phone)
      },
      description: cleanValue(formData.description),

      // Optional fields - only include if they have values
      responsibilities: responsibilities.filter(item => item.trim()),
      benefits: benefits.filter(item => item.trim()),
      requirements: {
        education: cleanValue(formData.requirements?.education),
        skills: requiredSkills.filter(skill => skill.trim()),
        certifications: formData.requirements?.certifications?.filter(cert => cert.trim()) || []
      }
    }

    // Only include optional fields if they have meaningful values
    if (cleanValue(formData.jobType)) {
      previewJobData.jobType = cleanValue(formData.jobType)
    }

    if (cleanValue(formData.industry)) {
      previewJobData.industry = cleanValue(formData.industry)
    }

    if (cleanValue(formData.department)) {
      previewJobData.department = cleanValue(formData.department)
    }

    // Only include salary if min or max is provided and not empty
    if ((formData.salary?.min && formData.salary.min > 0) || (formData.salary?.max && formData.salary.max > 0)) {
      previewJobData.salary = {
        min: formData.salary?.min || undefined,
        max: formData.salary?.max || undefined,
        currency: 'INR',
        period: cleanValue(formData.salary?.period) || 'Yearly'
      }
    }

    // Only include location details if any location field is provided
    const hasLocationData = formData.location?.type || formData.location?.city || formData.location?.state || formData.location?.country
    if (hasLocationData) {
      previewJobData.location = {
        type: cleanValue(formData.location?.type),
        city: cleanValue(formData.location?.city),
        state: cleanValue(formData.location?.state),
        country: cleanValue(formData.location?.country),
        address: cleanValue(formData.location?.address)
      }
    }

    // Only include application deadline if provided
    if (formData.applicationDeadline) {
      previewJobData.applicationDeadline = formData.applicationDeadline
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
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Job Preview
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Review your job posting before publishing</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden transform hover:scale-[1.02] transition-all duration-500" style={{ transformStyle: 'preserve-3d' }}>
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 px-4 sm:px-6 md:px-8 py-4 sm:py-6 text-white relative overflow-hidden">
            {/* 3D Background Elements */}
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full -translate-y-12 sm:-translate-y-16 translate-x-12 sm:translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 bg-white/5 rounded-full translate-y-8 sm:translate-y-12 -translate-x-8 sm:-translate-x-12"></div>
            <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between">
              <div className="mb-4 sm:mb-0 transform hover:scale-105 transition-transform duration-300">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 drop-shadow-lg" style={{
                  textShadow: '0 4px 8px rgba(0,0,0,0.3)'
                }}>{previewData.title}</h2>
                <p className="text-purple-100 text-base sm:text-lg font-medium drop-shadow-md">{previewData.company?.name}</p>
                <p className="text-purple-200 text-sm mt-1">{previewData.industry}</p>
              </div>
              <div className="text-left sm:text-right transform hover:scale-105 transition-transform duration-300">
                <span className="inline-block bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-2 shadow-lg hover:bg-white/30 transition-all duration-300">
                  {previewData.jobType}
                </span>
                {previewData.location?.city && (
                  <div className="text-purple-100 text-xs sm:text-sm flex items-center sm:justify-end">
                    <span className="mr-1">📍</span>
                    {previewData.location.city}
                    {previewData.location?.state && `, ${previewData.location.state}`}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
            {/* Job Description */}
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3">Job Description</h3>
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">{previewData.description}</p>
            </div>

            {/* Key Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Job Details */}
              <div className="space-y-3 sm:space-y-4">
                <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Job Details</h4>
                <div className="space-y-3">
                  {previewData.salary?.min && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Salary:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(previewData.salary.min)} - {formatCurrency(previewData.salary.max)} {previewData.salary?.period}
                      </span>
                    </div>
                  )}
                  {previewData.requirements?.experience?.min && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Experience:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{previewData.requirements.experience.min} years</span>
                    </div>
                  )}
                  {previewData.requirements?.education && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Education:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{previewData.requirements.education}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-3 sm:space-y-4">
                <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Contact Information</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Contact Person:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{previewData.contactPerson?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Phone:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{previewData.contactPerson?.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Job ID:</span>
                    <span className="font-medium text-gray-500 dark:text-gray-400 text-sm">Generated after posting</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills */}
            {previewData.requirements?.skills?.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Required Skills</h4>
                <div className="flex flex-wrap gap-3">
                  {previewData.requirements.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="skill-badge-3d bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-800 dark:to-purple-700 text-purple-800 dark:text-purple-200 px-4 py-2 rounded-full text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
                      style={{ '--delay': index }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Responsibilities */}
            {previewData.responsibilities?.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Key Responsibilities</h4>
                <ul className="space-y-2">
                  {previewData.responsibilities.map((responsibility, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-500 mr-3 mt-1">•</span>
                      <span className="text-gray-700 dark:text-gray-300">{responsibility}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Benefits */}
            {previewData.benefits?.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Benefits & Perks</h4>
                <ul className="space-y-3">
                  {previewData.benefits.map((benefit, index) => (
                    <li
                      key={index}
                      className="benefit-item-3d flex items-start p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 transform hover:scale-105 transition-all duration-300"
                      style={{ '--delay': index }}
                    >
                      <span className="text-green-500 mr-3 mt-1 text-lg animate-pulse">✓</span>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 px-4 sm:px-6 md:px-8 py-4 sm:py-6 flex flex-col sm:flex-row items-center justify-between border-t border-purple-200 dark:border-purple-700 space-y-3 sm:space-y-0">
            <button
              type="button"
              onClick={handleEdit}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 border border-purple-300 dark:border-purple-500 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-800 transition-all duration-300 flex items-center justify-center transform hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base"
            >
              <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              Edit Job
            </button>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 border border-purple-300 dark:border-purple-500 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-800 transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePostJob}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg transition-all duration-300 flex items-center justify-center disabled:opacity-50 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
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
                    {isRecording ? 'Stop Recording' : isProcessingVoice ? 'Processing...' : 'Fill with Voice'}
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
                <strong>🎤 AI Voice Input:</strong> "Software Engineer at Google, Technology industry, Full-time job, contact John Smith at 9876543210"
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
                  {isRecording ? `Recording: ${recordingTime}/30 seconds` : 'Processing...'}
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
                  {isRecording ? 'Speak clearly about the job details...' :
                   isProcessingVoice ? 'Processing with OpenAI...' :
                   'Voice input active'}
                </p>
                {isRecording && (
                  <button
                    type="button"
                    onClick={stopVoiceRecording}
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
            className="dropdown-button w-full p-4 sm:p-6 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 rounded-xl cursor-pointer"
          >
            <h2 className="text-lg sm:text-xl font-semibold flex items-center text-gray-900 dark:text-white">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
              <span className="hidden sm:inline">Location & Salary</span>
              <span className="sm:hidden">Location</span>
              <span className="text-gray-500 text-xs sm:text-sm font-normal ml-1 sm:ml-2 hidden sm:inline">(Optional)</span>
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                {expandedOptionalFields.location ? 'Hide' : 'Click to Add Location & Salary'}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 sm:hidden">
                {expandedOptionalFields.location ? 'Hide' : 'Add'}
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
            className="dropdown-button w-full p-4 sm:p-6 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 rounded-xl cursor-pointer"
          >
            <h2 className="text-lg sm:text-xl font-semibold flex items-center text-gray-900 dark:text-white">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
              Requirements
              <span className="text-gray-500 text-xs sm:text-sm font-normal ml-1 sm:ml-2 hidden sm:inline">(Optional)</span>
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                {expandedOptionalFields.requirements ? 'Hide' : 'Click to Add Requirements'}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 sm:hidden">
                {expandedOptionalFields.requirements ? 'Hide' : 'Add'}
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
            className="dropdown-button w-full p-4 sm:p-6 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 rounded-xl cursor-pointer"
          >
            <h2 className="text-lg sm:text-xl font-semibold flex items-center text-gray-900 dark:text-white">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
              Responsibilities
              <span className="text-gray-500 text-xs sm:text-sm font-normal ml-1 sm:ml-2 hidden sm:inline">(Optional)</span>
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                {expandedOptionalFields.responsibilities ? 'Hide' : 'Click to Add Responsibilities'}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 sm:hidden">
                {expandedOptionalFields.responsibilities ? 'Hide' : 'Add'}
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
            className="dropdown-button w-full p-4 sm:p-6 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 rounded-xl cursor-pointer"
          >
            <h2 className="text-lg sm:text-xl font-semibold flex items-center text-gray-900 dark:text-white">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
              Benefits
              <span className="text-gray-500 text-xs sm:text-sm font-normal ml-1 sm:ml-2 hidden sm:inline">(Optional)</span>
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                {expandedOptionalFields.benefits ? 'Hide' : 'Click to Add Benefits'}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 sm:hidden">
                {expandedOptionalFields.benefits ? 'Hide' : 'Add'}
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