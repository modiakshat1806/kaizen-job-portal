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

      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .job-posting-title {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        text-shadow: 0 4px 8px rgba(0,0,0,0.1);
      }

      .form-section {
        background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.1);
      }

      .input-field:focus {
        transform: translateY(-1px);
        box-shadow: 0 8px 25px rgba(139, 92, 246, 0.15);
      }

      .btn-primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        transform: translateY(0);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 35px rgba(139, 92, 246, 0.3);
      }

      .btn-outline {
        border: 2px solid transparent;
        background: linear-gradient(white, white) padding-box, linear-gradient(135deg, #667eea, #764ba2) border-box;
        transition: all 0.3s ease;
      }

      .btn-outline:hover {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        transform: translateY(-1px);
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

  // Voice functionality state - CLEAN IMPLEMENTATION
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
    'AI Engineer',
    'Software Engineer',
    'Data Scientist',
    'Product Manager',
    'UX Designer',
    'DevOps Engineer',
    'Full Stack Developer',
    'Backend Developer',
    'Frontend Developer',
    'Mobile App Developer',
    'Cloud Architect',
    'Cybersecurity Analyst',
    'Business Analyst',
    'Project Manager',
    'Marketing Manager',
    'Sales Executive',
    'HR Manager',
    'Financial Analyst',
    'Operations Manager',
    'Quality Assurance Engineer'
  ]

  // Voice recording functions using OpenAI Whisper - CLEAN IMPLEMENTATION
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

    } catch (error) {
      console.error('Voice processing error:', error)
      toast.error('Failed to process voice input. Please try again.')
    } finally {
      setIsProcessingVoice(false)
    }
  }

export default JobPostingForm
