import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { ChevronLeft, ChevronRight, Check, User, Heart, Target, MapPin, ChevronDown } from 'lucide-react'
import { studentAPI, fitmentAPI, recommendationsAPI } from '../services/api'

const StudentAssessment = () => {
  const navigate = useNavigate()
  const { register, handleSubmit, watch, formState: { errors }, setValue, reset } = useForm()

  // State management
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showLoadingModal, setShowLoadingModal] = useState(false)
  const [selectedCoreValues, setSelectedCoreValues] = useState([])
  const [sliderValues, setSliderValues] = useState({
    independence: 50,
    routine: 50,
    pace: 50,
    focus: 50,
    approach: 50
  })
  const [bubbleAnswers, setBubbleAnswers] = useState({
    q1: null,
    q2: null,
    q3: null,
    q4: null,
    q5: null,
    q6: null,
    q7: null,
    q8: null,
    q9: null,
    q10: null
  })
  const [degreeDropdownOpen, setDegreeDropdownOpen] = useState(false)
  const [selectedDegree, setSelectedDegree] = useState('')
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false)
  const [selectedYear, setSelectedYear] = useState('')
  const [showProgressPopup, setShowProgressPopup] = useState(false)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (degreeDropdownOpen && !event.target.closest('.degree-dropdown')) {
        setDegreeDropdownOpen(false)
      }
      if (yearDropdownOpen && !event.target.closest('.year-dropdown')) {
        setYearDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [degreeDropdownOpen, yearDropdownOpen])

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Add CSS animations
  useEffect(() => {
    const assessmentAnimationStyles = `
      @keyframes assessmentTitlePop {
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

      @keyframes sliderBounce {
        0% {
          transform: translateX(-50%) scale(0.8);
        }
        50% {
          transform: translateX(-50%) scale(1.1);
        }
        100% {
          transform: translateX(-50%) scale(1);
        }
      }

      @keyframes progressPopup {
        0% {
          transform: translateY(-20px) scale(0.8);
          opacity: 0;
        }
        100% {
          transform: translateY(0) scale(1);
          opacity: 1;
        }
      }
    `
    const styleSheet = document.createElement('style')
    styleSheet.textContent = assessmentAnimationStyles
    document.head.appendChild(styleSheet)
    return () => document.head.removeChild(styleSheet)
  }, [])

  // Clear any existing saved state on component mount
  useEffect(() => {
    localStorage.removeItem('studentAssessmentState')
    localStorage.removeItem('studentAssessmentFormData')
    localStorage.removeItem('studentAssessmentSessionId')
    reset() // Reset form to initial state
  }, [reset])

  const steps = [
    { id: 1, title: 'Basic Information', icon: User },
    { id: 2, title: 'Core Values', icon: Heart },
    { id: 3, title: 'Work Preferences', icon: Target },
    { id: 4, title: 'Work Style Assessment', icon: MapPin }
  ]

  const coreValues = [
    'Accountability',
    'Adaptability',
    'Ambition',
    'Attention to Detail',
    'Collaboration',
    'Communication',
    'Continuous Learning',
    'Creativity',
    'Customer Focus',
    'Data-Driven',
    'Empathy',
    'Efficiency',
    'Ethicality',
    'Innovation',
    'Integrity',
    'Leadership',
    'Logical Thinking',
    'Problem-Solving',
    'Resilience',
    'Teamwork'
  ]

  const handleCoreValueClick = (value) => {
    if (selectedCoreValues.includes(value)) {
      setSelectedCoreValues(selectedCoreValues.filter(v => v !== value))
    } else if (selectedCoreValues.length < 5) {
      setSelectedCoreValues([...selectedCoreValues, value])
    }
  }

  const handleSliderChange = (sliderName, value) => {
    setSliderValues(prev => ({
      ...prev,
      [sliderName]: parseInt(value)
    }))
  }

  const areAllSlidersMoved = () => {
    return Object.values(sliderValues).every(value => value !== 50)
  }

  const handleBubbleClick = (question, value) => {
    setBubbleAnswers(prev => ({
      ...prev,
      [question]: value
    }))
  }

  const areAllBubblesSelected = () => {
    return Object.values(bubbleAnswers).every(value => value !== null)
  }


  const calculateAssessmentScore = (data) => {
    console.log('Calculating assessment score with data:', data)
    console.log('Core values:', selectedCoreValues)
    console.log('Slider values:', sliderValues)
    console.log('Bubble answers:', bubbleAnswers)

    // Base scores
    let technical = 40
    let communication = 40
    let problemSolving = 40
    let teamwork = 40

    // 1. Education level adjustment (20 points max)
    const educationLevels = {
      'High School': 5,
      'BTech': 15,
      'Bachelor': 15,
      'Master': 18,
      'PhD': 20
    }
    const educationBonus = educationLevels[data.degree] || 10
    technical += educationBonus
    problemSolving += educationBonus * 0.8

    // 2. Core values assessment (15 points max per category)
    const coreValueScores = {
      'Technical Excellence': { technical: 15, problemSolving: 10 },
      'Innovation': { technical: 12, problemSolving: 15 },
      'Problem-Solving': { problemSolving: 15, technical: 8 },
      'Collaboration': { teamwork: 15, communication: 10 },
      'Communication': { communication: 15, teamwork: 8 },
      'Leadership': { communication: 12, teamwork: 12 },
      'Data-Driven': { technical: 12, problemSolving: 12 },
      'Accountability': { teamwork: 10, problemSolving: 8 },
      'Adaptability': { problemSolving: 10, communication: 8 },
      'Customer Focus': { communication: 12, teamwork: 10 }
    }

    selectedCoreValues.forEach(value => {
      const scores = coreValueScores[value] || {}
      technical += scores.technical || 0
      communication += scores.communication || 0
      problemSolving += scores.problemSolving || 0
      teamwork += scores.teamwork || 0
    })

    // 3. Work preferences (slider values) - 15 points max per category
    if (sliderValues.independence >= 70) {
      technical += 10
      problemSolving += 8
    }
    if (sliderValues.routine <= 30) {
      problemSolving += 12
      technical += 8
    }
    if (sliderValues.pace >= 60) {
      technical += 8
      problemSolving += 10
    }
    if (sliderValues.focus >= 60) {
      technical += 12
      problemSolving += 8
    }
    if (sliderValues.approach >= 60) {
      communication += 10
      teamwork += 12
    }

    // 4. Work style questions (bubble answers) - 10 points max per category
    Object.values(bubbleAnswers).forEach((answer, index) => {
      // Different questions contribute to different skills
      switch(index) {
        case 0: // Problem approach
          if (answer >= 3) {
            problemSolving += 8
            technical += 5
          }
          break
        case 1: // Team collaboration
          if (answer >= 3) {
            teamwork += 8
            communication += 5
          }
          break
        case 2: // Communication style
          if (answer >= 3) {
            communication += 8
            teamwork += 4
          }
          break
        case 3: // Technical challenges
          if (answer >= 3) {
            technical += 8
            problemSolving += 4
          }
          break
        default:
          // Other questions contribute generally
          if (answer >= 3) {
            technical += 2
            communication += 2
            problemSolving += 2
            teamwork += 2
          }
      }
    })

    const finalScores = {
      technical: Math.min(Math.max(technical, 20), 100),
      communication: Math.min(Math.max(communication, 20), 100),
      problemSolving: Math.min(Math.max(problemSolving, 20), 100),
      teamwork: Math.min(Math.max(teamwork, 20), 100)
    }

    console.log('Calculated assessment scores:', finalScores)
    return finalScores
  }

  const nextStep = () => {
    if (currentStep === 1) {
      const name = watch('name')
      const email = watch('email')
      const phone = watch('phone')
      const degree = watch('degree')
      const graduationYear = watch('graduationYear')
      const specialization = watch('specialization')
      const institution = watch('institution')
      
      if (!name || !email || !phone || !selectedDegree || !selectedYear || !specialization || !institution) {
        toast.error('Please fill in all required fields')
        return
      }
    } else if (currentStep === 2) {
      if (selectedCoreValues.length !== 5) {
        toast.error('Please select exactly 5 core values')
        return
      }
    } else if (currentStep === 3) {
      if (!areAllSlidersMoved()) {
        toast.error('Please adjust all sliders from their default values')
        return
      }
    } else if (currentStep === 4) {
      if (!areAllBubblesSelected()) {
        toast.error('Please answer all questions before proceeding')
        return
      }
    }
    
    if (currentStep < steps.length) {
      console.log('Moving to next step:', currentStep + 1)
      setCurrentStep(currentStep + 1)
      setShowProgressPopup(true)
      console.log('Progress popup shown')

      // Scroll to top of page smoothly
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })

      setTimeout(() => {
        setShowProgressPopup(false)
        console.log('Progress popup hidden')
      }, 2000)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const onSubmit = async (data) => {
    console.log('Form submitted with data:', data)
    console.log('Current state:', { selectedCoreValues, sliderValues, bubbleAnswers })
    setIsSubmitting(true)
    try {
      const assessmentScore = calculateAssessmentScore(data)

      const studentData = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        education: {
          degree: data.degree,
          field: data.specialization || data.field || 'General',
          institution: data.institution,
          graduationYear: parseInt(data.graduationYear)
        },
        careerGoals: data.careerGoals || "Career advancement and professional growth",
        experienceYears: parseInt(data.experienceYears) || 0,
        assessmentScore,
        coreValues: selectedCoreValues,
        workPreferences: sliderValues,
        workStyle: bubbleAnswers
      }

      console.log('Sending student data to API:', JSON.stringify(studentData, null, 2))

      await studentAPI.saveAssessment(studentData)

      toast.success('Assessment completed successfully!')

      // Show loading modal for career matching
      setShowLoadingModal(true)

      // Check if user came from a job page
      const returnToJob = localStorage.getItem('returnToJob')

      if (returnToJob) {
        const jobInfo = JSON.parse(returnToJob)
        localStorage.removeItem('returnToJob')

        // Navigate back to job page with phone number for fitment calculation
        navigate(`/job/${jobInfo.jobId}`, {
          state: {
            fromAssessment: true,
            studentPhone: data.phone
          }
        })
      } else {
        // Try to generate recommendations using the AI API first
        try {
          const assessmentData = {
            fullName: data.name,
            coreValues: selectedCoreValues,
            workPreferences: sliderValues,
            behavioralAnswers: bubbleAnswers
          }

          const recommendationsResponse = await recommendationsAPI.generateRecommendations(assessmentData)

          // Navigate to /career-match with the AI recommendations
          navigate('/career-match', {
            state: {
              recommendations: recommendationsResponse.data.recommendations,
              student: {
                name: data.name,
                phone: data.phone,
                education: {
                  degree: data.degree,
                  institution: data.institution,
                  graduationYear: data.graduationYear,
                  specialization: data.specialization
                },
                coreValues: selectedCoreValues,
                assessmentScore
              },
              totalRecommendations: recommendationsResponse.data.totalRecommendations,
              fromAssessment: true,
              generatedAt: recommendationsResponse.data.generatedAt
            }
          })
        } catch (recommendationError) {
          console.log('Recommendations API failed, falling back to career-match-results:', recommendationError)

          // Fallback to the original career-match-results approach
          const assessmentData = {
            basicDetails: {
              name: data.name,
              email: data.email,
              phone: data.phone,
              degree: data.degree,
              graduationYear: data.graduationYear,
              specialization: data.specialization,
              institution: data.institution
            },
            coreValues: selectedCoreValues,
            workPreferences: sliderValues,
            workStyle: bubbleAnswers
          }

          navigate('/career-match-results', { state: { assessmentData } })
        }
      }
    } catch (error) {
      console.error('Assessment submission error:', error)
      console.error('Error response:', error.response?.data)
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.error || 'Validation failed'
        console.error('Validation error details:', error.response?.data?.details)
        toast.error(errorMessage)
      } else {
        toast.error(error.response?.data?.error || 'Failed to save assessment')
      }
    } finally {
      setIsSubmitting(false)
      setShowLoadingModal(false)
    }
  }

  const renderStepIndicator = () => (
    <div className="mb-8">
      {/* Progress Bar Background */}
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = currentStep === step.id
            const isCompleted = currentStep > step.id

            return (
              <div key={step.id} className="flex flex-col items-center relative z-10">
                {/* Step Circle - Smaller on mobile */}
                <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full border-3 font-medium text-xs sm:text-sm transition-all duration-300 ${
                  isActive
                    ? 'border-purple-600 bg-purple-600 text-white shadow-lg scale-110'
                    : isCompleted
                    ? 'border-green-500 bg-green-500 text-white shadow-md'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                }`}>
                  {isCompleted ? (
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                  ) : (
                    <Icon className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                  )}
                </div>

                {/* Step Label - Hidden on mobile, only show icons */}
                <div className="mt-1 sm:mt-2 text-center max-w-12 sm:max-w-16 md:max-w-20 hidden md:block">
                  <div className={`text-xs sm:text-xs md:text-sm font-medium transition-colors duration-300 leading-tight ${
                    isActive
                      ? 'text-purple-600 dark:text-purple-400'
                      : isCompleted
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {step.title}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Animated Progress Line - Responsive positioning */}
        <div className="absolute top-4 sm:top-5 md:top-6 h-1 bg-gray-200 dark:bg-gray-700 rounded-full -z-0" style={{
          left: '2rem',
          right: '2rem'
        }}>
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-green-500 rounded-full transition-all duration-700 ease-in-out"
            style={{
              width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`
            }}
          />
        </div>
      </div>
    </div>
  )

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="form-section">
            <h3 className="text-xl font-semibold mb-6">Basic Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter your full name"
                  {...register('name', { required: 'Name is required' })}
                />
                {errors.name && <p className="form-error">{errors.name.message}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="Enter your email address"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Please enter a valid email'
                    }
                  })}
                />
                {errors.email && <p className="form-error">{errors.email.message}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input
                  type="tel"
                  className="input-field"
                  placeholder="Enter your phone number"
                  {...register('phone', { 
                    required: 'Phone number is required',
                    pattern: {
                      value: /^[0-9+\-\s()]+$/,
                      message: 'Please enter a valid phone number'
                    }
                  })}
                />
                {errors.phone && <p className="form-error">{errors.phone.message}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Degree *</label>
                <div className="relative degree-dropdown">
                  <button
                    type="button"
                    onClick={() => setDegreeDropdownOpen(!degreeDropdownOpen)}
                    className="input-field flex items-center justify-between w-full text-left"
                  >
                    <span className={selectedDegree ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-300'}>
                      {selectedDegree || 'Select Degree'}
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${degreeDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {degreeDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-[100] max-h-60 overflow-y-auto">
                      {['BE', 'BTech', 'MSc', 'MTech', 'MBA', 'BBA', 'BCom', 'BCA', 'MCA'].map((degree) => (
                        <button
                          key={degree}
                          type="button"
                          onClick={() => {
                            setSelectedDegree(degree)
                            setValue('degree', degree)
                            setDegreeDropdownOpen(false)
                          }}
                          className="w-full px-4 py-3 text-left text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg"
                        >
                          {degree}
                        </button>
                      ))}
                    </div>
                  )}
                  <input
                    type="hidden"
                    {...register('degree', { required: 'Degree is required' })}
                    value={selectedDegree}
                  />
                </div>
                {errors.degree && <p className="form-error">{errors.degree.message}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Year of Graduation *</label>
                <div className="relative year-dropdown">
                  <button
                    type="button"
                    onClick={() => {
                      setYearDropdownOpen(!yearDropdownOpen)
                      setDegreeDropdownOpen(false) // Close degree dropdown
                    }}
                    className="input-field flex items-center justify-between w-full text-left"
                  >
                    <span className={selectedYear ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-300'}>
                      {selectedYear || 'Select Year'}
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${yearDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {yearDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-[100] max-h-60 overflow-y-auto">
                      {Array.from({ length: 10 }, (_, i) => {
                        const year = new Date().getFullYear() + 4 - i
                        return (
                          <button
                            key={year}
                            type="button"
                            onClick={() => {
                              setSelectedYear(year.toString())
                              setValue('graduationYear', year.toString())
                              setYearDropdownOpen(false)
                            }}
                            className="w-full px-4 py-3 text-left text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg"
                          >
                            {year}
                          </button>
                        )
                      })}
                    </div>
                  )}
                  <input
                    type="hidden"
                    {...register('graduationYear', { required: 'Graduation year is required' })}
                    value={selectedYear}
                  />
                </div>
                {errors.graduationYear && <p className="form-error">{errors.graduationYear.message}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Specialization *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Computer Science"
                  {...register('specialization', { required: 'Specialization is required' })}
                />
                {errors.specialization && <p className="form-error">{errors.specialization.message}</p>}
              </div>

              <div className="form-group md:col-span-2">
                <label className="form-label">Institution *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter your institution name"
                  {...register('institution', { required: 'Institution is required' })}
                />
                {errors.institution && <p className="form-error">{errors.institution.message}</p>}
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="form-section">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Core Values Assessment</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">Select the 5 core values that matter most to you from the list below.</p>
            
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Selected: {selectedCoreValues.length}/5
                </span>
                {selectedCoreValues.length === 5 && (
                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">✓ All 5 values selected</span>
                )}
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
                {coreValues.map((value) => {
                  const isSelected = selectedCoreValues.includes(value)
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleCoreValueClick(value)}
                      className={`p-2 sm:p-3 rounded-lg border-2 transition-all duration-200 text-xs sm:text-sm font-medium text-center ${
                        isSelected
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 shadow-md'
                          : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                      } ${
                        !isSelected && selectedCoreValues.length >= 5
                          ? 'opacity-50 cursor-not-allowed'
                          : 'cursor-pointer'
                      }`}
                      disabled={!isSelected && selectedCoreValues.length >= 5}
                    >
                      {value}
                    </button>
                  )
                })}
              </div>
            </div>

            {selectedCoreValues.length > 0 && (
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
                <h4 className="font-medium text-purple-900 dark:text-purple-300 mb-2">Your Selected Core Values:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCoreValues.map((value) => (
                    <span
                      key={value}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200"
                    >
                      {value}
                      <button
                        type="button"
                        onClick={() => handleCoreValueClick(value)}
                        className="ml-2 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case 3:
        return (
          <div className="form-section">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
                <Target className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Work Preferences Assessment</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">Please adjust each slider to reflect your work preferences. All sliders must be moved from their default position to continue.</p>
            
            <div className="space-y-8">
              {/* Question 1 */}
              <div className="space-y-3 sm:space-y-4">
                <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">Do you prefer working independently or with others?</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    <span>Independently</span>
                    <span>With Others</span>
                  </div>
                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sliderValues.independence}
                      onChange={(e) => handleSliderChange('independence', e.target.value)}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, #7c3aed 0%, #7c3aed ${sliderValues.independence}%, #e5e7eb ${sliderValues.independence}%, #e5e7eb 100%)`
                      }}
                    />
                    <div
                      className="absolute top-[-30px] sm:top-[-35px] bg-purple-600 text-white text-xs font-bold px-1 sm:px-2 py-1 rounded transform -translate-x-1/2"
                      style={{
                        left: `${sliderValues.independence}%`,
                        transition: 'left 0.1s ease-out'
                      }}
                    >
                      {sliderValues.independence}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-purple-600"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Question 2 */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white">Do you thrive on routines or flexibility?</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                    <span>Routines</span>
                    <span>Flexibility</span>
                  </div>
                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sliderValues.routine}
                      onChange={(e) => handleSliderChange('routine', e.target.value)}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, #7c3aed 0%, #7c3aed ${sliderValues.routine}%, #e5e7eb ${sliderValues.routine}%, #e5e7eb 100%)`
                      }}
                    />
                    <div
                      className="absolute top-[-35px] bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded transform -translate-x-1/2"
                      style={{
                        left: `${sliderValues.routine}%`,
                        transition: 'left 0.1s ease-out'
                      }}
                    >
                      {sliderValues.routine}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-purple-600"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Question 3 */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white">What work pace energizes you most?</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                    <span>Steady Pace</span>
                    <span>Fast Pace</span>
                  </div>
                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sliderValues.pace}
                      onChange={(e) => handleSliderChange('pace', e.target.value)}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, #7c3aed 0%, #7c3aed ${sliderValues.pace}%, #e5e7eb ${sliderValues.pace}%, #e5e7eb 100%)`
                      }}
                    />
                    <div
                      className="absolute top-[-35px] bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded transform -translate-x-1/2"
                      style={{
                        left: `${sliderValues.pace}%`,
                        transition: 'left 0.1s ease-out'
                      }}
                    >
                      {sliderValues.pace}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-purple-600"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Question 4 */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white">Do you like switching tasks or going deep into one?</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                    <span>Switching Tasks</span>
                    <span>Deep Focus</span>
                  </div>
                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sliderValues.focus}
                      onChange={(e) => handleSliderChange('focus', e.target.value)}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, #7c3aed 0%, #7c3aed ${sliderValues.focus}%, #e5e7eb ${sliderValues.focus}%, #e5e7eb 100%)`
                      }}
                    />
                    <div
                      className="absolute top-[-35px] bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded transform -translate-x-1/2"
                      style={{
                        left: `${sliderValues.focus}%`,
                        transition: 'left 0.1s ease-out'
                      }}
                    >
                      {sliderValues.focus}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-purple-600"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Question 5 */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white">Do you like building things or thinking about big ideas?</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                    <span>Building Things</span>
                    <span>Big Ideas</span>
                  </div>
                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sliderValues.approach}
                      onChange={(e) => handleSliderChange('approach', e.target.value)}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, #7c3aed 0%, #7c3aed ${sliderValues.approach}%, #e5e7eb ${sliderValues.approach}%, #e5e7eb 100%)`
                      }}
                    />
                    <div
                      className="absolute top-[-35px] bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded transform -translate-x-1/2"
                      style={{
                        left: `${sliderValues.approach}%`,
                        transition: 'left 0.1s ease-out'
                      }}
                    >
                      {sliderValues.approach}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-purple-600"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="form-section">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Work Style Assessment</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">Please rate how much you agree with each statement by selecting one bubble for each question.</p>
            
            <div className="space-y-6 sm:space-y-8">
              {/* Question 1 */}
              <div className="space-y-3 sm:space-y-4">
                <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">I prefer working in a team rather than alone</h4>
                <div className="flex flex-col space-y-3">
                  <div className="flex justify-between items-center text-xs sm:text-sm text-gray-600 dark:text-gray-300 px-2">
                    <span>Strongly Disagree</span>
                    <span>Strongly Agree</span>
                  </div>
                  <div className="flex justify-center space-x-2 sm:space-x-3">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleBubbleClick('q1', value)}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 transition-all duration-200 text-xs sm:text-sm ${
                          bubbleAnswers.q1 === value
                            ? 'border-primary-600 bg-primary-600 text-white'
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:border-primary-400 dark:hover:border-primary-500'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Question 2 */}
              <div className="space-y-3 sm:space-y-4">
                <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">I enjoy taking on leadership roles in projects</h4>
                <div className="flex flex-col space-y-3">
                  <div className="flex justify-between items-center text-xs sm:text-sm text-gray-600 dark:text-gray-300 px-2">
                    <span>Strongly Disagree</span>
                    <span>Strongly Agree</span>
                  </div>
                  <div className="flex justify-center space-x-2 sm:space-x-3">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleBubbleClick('q2', value)}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 transition-all duration-200 text-xs sm:text-sm ${
                          bubbleAnswers.q2 === value
                            ? 'border-primary-600 bg-primary-600 text-white'
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:border-primary-400 dark:hover:border-primary-500'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Question 3 */}
              <div className="space-y-3 sm:space-y-4">
                <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">I'm comfortable with ambiguous or unclear tasks</h4>
                <div className="flex flex-col space-y-3">
                  <div className="flex justify-between items-center text-xs sm:text-sm text-gray-600 dark:text-gray-300 px-2">
                    <span>Strongly Disagree</span>
                    <span>Strongly Agree</span>
                  </div>
                  <div className="flex justify-center space-x-2 sm:space-x-3">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleBubbleClick('q3', value)}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 transition-all duration-200 text-xs sm:text-sm ${
                          bubbleAnswers.q3 === value
                            ? 'border-primary-600 bg-primary-600 text-white'
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:border-primary-400 dark:hover:border-primary-500'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Question 4 */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white">I prefer structured, well-defined processes</h4>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Strongly Disagree</span>
                  <div className="flex space-x-3">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleBubbleClick('q4', value)}
                        className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                          bubbleAnswers.q4 === value
                            ? 'border-primary-600 bg-primary-600 text-white'
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:border-primary-400 dark:hover:border-primary-500'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">Strongly Agree</span>
                </div>
              </div>

              {/* Question 5 */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white">I enjoy learning new technologies and tools</h4>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Strongly Disagree</span>
                  <div className="flex space-x-3">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleBubbleClick('q5', value)}
                        className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                          bubbleAnswers.q5 === value
                            ? 'border-primary-600 bg-primary-600 text-white'
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:border-primary-400 dark:hover:border-primary-500'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">Strongly Agree</span>
                </div>
              </div>

              {/* Question 6 */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white">I work better under pressure and tight deadlines</h4>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Strongly Disagree</span>
                  <div className="flex space-x-3">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleBubbleClick('q6', value)}
                        className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                          bubbleAnswers.q6 === value
                            ? 'border-primary-600 bg-primary-600 text-white'
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:border-primary-400 dark:hover:border-primary-500'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">Strongly Agree</span>
                </div>
              </div>

              {/* Question 7 */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white">I prefer creative problem-solving over following procedures</h4>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Strongly Disagree</span>
                  <div className="flex space-x-3">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleBubbleClick('q7', value)}
                        className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                          bubbleAnswers.q7 === value
                            ? 'border-primary-600 bg-primary-600 text-white'
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:border-primary-400 dark:hover:border-primary-500'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">Strongly Agree</span>
                </div>
              </div>

              {/* Question 8 */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white">I enjoy mentoring and helping others grow</h4>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Strongly Disagree</span>
                  <div className="flex space-x-3">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleBubbleClick('q8', value)}
                        className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                          bubbleAnswers.q8 === value
                            ? 'border-primary-600 bg-primary-600 text-white'
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:border-primary-400 dark:hover:border-primary-500'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">Strongly Agree</span>
                </div>
              </div>

              {/* Question 9 */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white">I'm motivated by challenging, complex problems</h4>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Strongly Disagree</span>
                  <div className="flex space-x-3">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleBubbleClick('q9', value)}
                        className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                          bubbleAnswers.q9 === value
                            ? 'border-primary-600 bg-primary-600 text-white'
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:border-primary-400 dark:hover:border-primary-500'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">Strongly Agree</span>
                </div>
              </div>

              {/* Question 10 */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white">I value work-life balance over career advancement</h4>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Strongly Disagree</span>
                  <div className="flex space-x-3">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleBubbleClick('q10', value)}
                        className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                          bubbleAnswers.q10 === value
                            ? 'border-primary-600 bg-primary-600 text-white'
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:border-primary-400 dark:hover:border-primary-500'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">Strongly Agree</span>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-purple-600 dark:bg-purple-700 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-2xl">🎓</span>
            </div>
          </div>
          <h1
            className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2"
            style={{
              animation: 'assessmentTitlePop 1.2s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards',
              transformStyle: 'preserve-3d',
              textShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }}
          >
            Student Assessment
          </h1>
          <p className="text-gray-600 dark:text-gray-300">Complete this assessment to help us match you with the best opportunities</p>

          {/* Go to Home button */}
          <div className="mt-4 flex justify-start">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-800 transition-colors duration-200"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Go to Home
            </button>
          </div>
        </div>

        {renderStepIndicator()}

        <form onSubmit={handleSubmit(onSubmit)} className="card">
        {renderStepContent()}

        <div className="flex justify-between pt-8 border-t border-gray-200">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="btn-outline flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {currentStep < steps.length ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={
                (currentStep === 1 && (!watch('name') || !watch('email') || !watch('phone') || !selectedDegree || !selectedYear || !watch('specialization') || !watch('institution'))) ||
                (currentStep === 2 && selectedCoreValues.length !== 5) ||
                (currentStep === 3 && !areAllSlidersMoved()) ||
                (currentStep === 4 && !areAllBubblesSelected())
              }
              className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting || !areAllBubblesSelected()}
              className="btn-primary flex items-center space-x-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>View Results</span>
                </>
              )}
            </button>
          )}
        </div>
        </form>

        {/* Progress Saved Popup */}
        {showProgressPopup && (
          <div className="fixed top-4 right-4 z-50">
            <div
              className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2"
              style={{
                animation: 'progressPopup 0.3s ease-out'
              }}
            >
              <Check className="w-5 h-5" />
              <span className="font-medium">Progress Saved!</span>
            </div>
          </div>
        )}

        {/* Loading Modal for Career Matching */}
        {showLoadingModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4 text-center">
              <div className="mb-6">
                <div className="relative">
                  <div className="w-24 h-24 mx-auto mb-6">
                    <div className="absolute inset-0 border-4 border-purple-200 dark:border-purple-700 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-purple-600 rounded-full border-t-transparent animate-spin"></div>
                    <div className="absolute inset-2 border-4 border-purple-400 rounded-full border-b-transparent animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
                    <div className="absolute inset-4 border-4 border-purple-300 rounded-full border-l-transparent animate-spin" style={{animationDuration: '2s'}}></div>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  🎯 Finding Your Perfect Career Matches
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Analyzing your assessment results and matching with the best opportunities...
                </p>
                <div className="space-y-2 text-sm text-purple-600 dark:text-purple-400 font-medium">
                  <div>✨ Evaluating your skills and preferences</div>
                  <div>🔍 Searching through thousands of opportunities</div>
                  <div>🎉 Preparing your personalized results</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentAssessment 