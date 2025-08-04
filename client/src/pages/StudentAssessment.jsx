import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { ChevronLeft, ChevronRight, Check, User, Heart, Target, MapPin, ChevronDown } from 'lucide-react'
import { studentAPI, fitmentAPI, recommendationsAPI } from '../services/api'

const StudentAssessment = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Add CSS animations for 3D assessment title effect and slider animations
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
  // Load saved state from localStorage on component mount
  const loadSavedState = () => {
    try {
      const savedState = localStorage.getItem('studentAssessmentState')
      if (savedState) {
        const parsed = JSON.parse(savedState)
        return {
          currentStep: parsed.currentStep || 1,
          selectedCoreValues: parsed.selectedCoreValues || [],
          sliderValues: parsed.sliderValues || {
            independence: 50,
            routine: 50,
            pace: 50,
            focus: 50,
            approach: 50
          },
          bubbleAnswers: parsed.bubbleAnswers || {
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
          }
        }
      }
    } catch (error) {
      console.error('Error loading saved state:', error)
    }
    return {
      currentStep: 1,
      selectedCoreValues: [],
      sliderValues: {
        independence: 50,
        routine: 50,
        pace: 50,
        focus: 50,
        approach: 50
      },
      bubbleAnswers: {
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
      }
    }
  }

  const savedState = loadSavedState()
  
  const [currentStep, setCurrentStep] = useState(savedState.currentStep)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedCoreValues, setSelectedCoreValues] = useState(savedState.selectedCoreValues)
  const [sliderValues, setSliderValues] = useState(savedState.sliderValues)
  const [bubbleAnswers, setBubbleAnswers] = useState(savedState.bubbleAnswers)
  const [degreeDropdownOpen, setDegreeDropdownOpen] = useState(false)
  const [selectedDegree, setSelectedDegree] = useState('')
  const [showProgressPopup, setShowProgressPopup] = useState(false)
  const navigate = useNavigate()
  
  const { register, handleSubmit, watch, formState: { errors }, setValue } = useForm()

  // Save state to localStorage whenever it changes
  const saveState = (newState) => {
    try {
      const stateToSave = {
        currentStep: newState.currentStep,
        selectedCoreValues: newState.selectedCoreValues,
        sliderValues: newState.sliderValues,
        bubbleAnswers: newState.bubbleAnswers
      }
      localStorage.setItem('studentAssessmentState', JSON.stringify(stateToSave))
    } catch (error) {
      console.error('Error saving state:', error)
    }
  }

  // Save state whenever any state changes
  useEffect(() => {
    saveState({
      currentStep,
      selectedCoreValues,
      sliderValues,
      bubbleAnswers
    })
  }, [currentStep, selectedCoreValues, sliderValues, bubbleAnswers])

  // Restore form values from saved state
  useEffect(() => {
    const savedState = loadSavedState()
    if (savedState.currentStep > 1) {
      // Restore form values if we have saved data
      const savedFormData = localStorage.getItem('studentAssessmentFormData')
      if (savedFormData) {
        try {
          const formData = JSON.parse(savedFormData)
          Object.keys(formData).forEach(key => {
            setValue(key, formData[key])
          })
        } catch (error) {
          console.error('Error restoring form data:', error)
        }
      }
    }
  }, [setValue])

  // Save form data whenever it changes
  useEffect(() => {
    const subscription = watch((value) => {
      try {
        localStorage.setItem('studentAssessmentFormData', JSON.stringify(value))
      } catch (error) {
        console.error('Error saving form data:', error)
      }
    })
    return () => subscription.unsubscribe()
  }, [watch])

  // Handle page visibility changes (when user switches tabs)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Save state immediately when user switches away
        saveState({
          currentStep,
          selectedCoreValues,
          sliderValues,
          bubbleAnswers
        })
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [currentStep, selectedCoreValues, sliderValues, bubbleAnswers])

  // Clear saved state when assessment is completed
  const clearSavedState = () => {
    localStorage.removeItem('studentAssessmentState')
    localStorage.removeItem('studentAssessmentFormData')
  }

  // Reset assessment to start over
  const resetAssessment = () => {
    clearSavedState()
    setCurrentStep(1)
    setSelectedCoreValues([])
    setSliderValues({
      independence: 50,
      routine: 50,
      pace: 50,
      focus: 50,
      approach: 50
    })
    setBubbleAnswers({
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
  }
  
  const steps = [
    { id: 1, title: 'Basic Information', icon: User },
    { id: 2, title: 'Core Values', icon: Heart },
    { id: 3, title: 'Step 3', icon: Target },
    { id: 4, title: 'Step 4', icon: MapPin }
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

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      // Calculate assessment scores based on form data
      const assessmentScore = calculateAssessmentScore(data)

      const studentData = {
        ...data,
        coreValues: selectedCoreValues,
        assessmentScore,
        education: {
          degree: data.degree,
          institution: data.institution
        }
      }

      // 1. POST the assessment to /api/student
      await studentAPI.saveAssessment(studentData)

      // Clear saved state after successful submission
      clearSavedState()

      toast.success('Assessment completed successfully!')

      // 2. Prepare assessment data for OpenAI recommendations
      const assessmentData = {
        fullName: data.name,
        coreValues: selectedCoreValues,
        workPreferences: sliderValues,
        behavioralAnswers: bubbleAnswers
      }

      // 3. Generate job recommendations using OpenAI
      const recommendationsResponse = await recommendationsAPI.generateRecommendations(assessmentData)

      // 4. Navigate to /career-match with the AI recommendations
      navigate('/career-match', {
        state: {
          recommendations: recommendationsResponse.data.recommendations,
          student: {
            name: data.name,
            phone: data.phone,
            education: {
              degree: data.degree,
              institution: data.institution
            },
            coreValues: selectedCoreValues,
            assessmentScore
          },
          totalRecommendations: recommendationsResponse.data.totalRecommendations,
          fromAssessment: true,
          generatedAt: recommendationsResponse.data.generatedAt
        }
      })
    } catch (error) {
      console.error('Assessment submission error:', error)
      if (error.response?.status === 429) {
        toast.error('AI service is currently busy. Please try again in a few minutes.')
      } else if (error.response?.status === 401) {
        toast.error('AI service configuration error. Please contact support.')
      } else if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.error || 'Assessment data validation failed'
        toast.error(errorMessage)
      } else if (error.response?.status === 500) {
        toast.error('Failed to generate job recommendations. Please try again.')
      } else {
        toast.error(error.response?.data?.error || 'Failed to process assessment')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const calculateAssessmentScore = (data) => {
    // Simple scoring algorithm - in real app, this would be more sophisticated
    let technical = 50
    let communication = 50
    let problemSolving = 50
    let teamwork = 50

    // Adjust based on education level
    const educationLevels = { 'High School': 30, 'Bachelor': 60, 'Master': 80, 'PhD': 90 }
    technical += educationLevels[data.degree] || 0

    // Cap scores at 100
    return {
      technical: Math.min(technical, 100),
      communication: Math.min(communication, 100),
      problemSolving: Math.min(problemSolving, 100),
      teamwork: Math.min(teamwork, 100)
    }
  }

  const nextStep = () => {
    if (currentStep === 1) {
      // Validate step 1 fields
      const name = watch('name')
      const email = watch('email')
      const phone = watch('phone')
      const degree = watch('degree')
      const institution = watch('institution')
      
      if (!name || !email || !phone || !degree || !institution) {
        toast.error('Please fill in all required fields')
        return
      }
    } else if (currentStep === 2) {
      // Validate step 2 - must have exactly 5 core values
      if (selectedCoreValues.length !== 5) {
        toast.error('Please select exactly 5 core values')
        return
      }
    } else if (currentStep === 3) {
      // Validate step 3 - all sliders must be moved from 50
      if (!areAllSlidersMoved()) {
        toast.error('Please adjust all sliders from their default values')
        return
      }
    } else if (currentStep === 4) {
      // Validate step 4 - all bubbles must be selected
      if (!areAllBubblesSelected()) {
        toast.error('Please answer all questions before proceeding')
        return
      }
    }
    
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
      // Show progress saved popup
      setShowProgressPopup(true)
      setTimeout(() => setShowProgressPopup(false), 2000)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center space-x-4 mb-8">
      {steps.map((step, index) => {
        const Icon = step.icon
        const isActive = currentStep === step.id
        const isCompleted = currentStep > step.id
        
        return (
          <div key={step.id} className="flex items-center">
            <div className={`step-indicator ${
              isActive ? 'step-active' : 
              isCompleted ? 'step-completed' : 'step-pending'
            }`}>
              {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
            </div>
            {index < steps.length - 1 && (
              <div className={`w-12 h-0.5 mx-2 ${
                isCompleted ? 'bg-green-500' : 'bg-gray-300'
              }`} />
            )}
          </div>
        )
      })}
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
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setDegreeDropdownOpen(!degreeDropdownOpen)}
                    className="input-field flex items-center justify-between w-full text-left"
                  >
                    <span className={selectedDegree ? 'text-gray-900' : 'text-gray-500'}>
                      {selectedDegree || 'Select Degree'}
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${degreeDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {degreeDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                      {['BE', 'BTech', 'MSc', 'MTech', 'MBA', 'BBA', 'BCom', 'BCA', 'MCA'].map((degree) => (
                        <button
                          key={degree}
                          type="button"
                          onClick={() => {
                            setSelectedDegree(degree)
                            setValue('degree', degree)
                            setDegreeDropdownOpen(false)
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg"
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
                <select className="input-field" {...register('graduationYear', { required: 'Graduation year is required' })}>
                  <option value="">Select Year</option>
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = new Date().getFullYear() + 4 - i
                    return <option key={year} value={year}>{year}</option>
                  })}
                </select>
                {errors.graduationYear && <p className="form-error">{errors.graduationYear.message}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Specialization *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g., Computer Science, Mechanical, Finance"
                  {...register('specialization', { required: 'Specialization is required' })}
                />
                {errors.specialization && <p className="form-error">{errors.specialization.message}</p>}
              </div>

              <div className="form-group md:col-span-2">
                <label className="form-label">Institution *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter your institution/university name"
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
            <p className="text-gray-600 mb-6">Select the 5 core values that matter most to you from the list below.</p>
            
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-700">
                  Selected: {selectedCoreValues.length}/5
                </span>
                {selectedCoreValues.length === 5 && (
                  <span className="text-sm text-green-600 font-medium">✓ All 5 values selected</span>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {coreValues.map((value) => {
                  const isSelected = selectedCoreValues.includes(value)
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleCoreValueClick(value)}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 text-sm font-medium ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
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
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Your Selected Core Values:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCoreValues.map((value) => (
                    <span
                      key={value}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {value}
                      <button
                        type="button"
                        onClick={() => handleCoreValueClick(value)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
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
            <p className="text-gray-600 mb-6">Please adjust each slider to reflect your work preferences. All sliders must be moved from their default position to continue.</p>
            
            <div className="space-y-8">
              {/* Question 1 */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Do you prefer working independently or with others?</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
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
                      className="absolute top-[-35px] bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded transform -translate-x-1/2"
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
                <h4 className="font-medium text-gray-900">Do you thrive on routines or flexibility?</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
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
                <h4 className="font-medium text-gray-900">What work pace energizes you most?</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
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
                <h4 className="font-medium text-gray-900">Do you like switching tasks or going deep into one?</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
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
                <h4 className="font-medium text-gray-900">Do you like building things or thinking about big ideas?</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
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
            
            <div className="space-y-8">
              {/* Question 1 */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">I prefer working in a team rather than alone</h4>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Strongly Disagree</span>
                  <div className="flex space-x-3">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleBubbleClick('q1', value)}
                        className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                          bubbleAnswers.q1 === value
                            ? 'border-primary-600 bg-primary-600 text-white'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-primary-400'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">Strongly Agree</span>
                </div>
              </div>

              {/* Question 2 */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">I enjoy taking on leadership roles in projects</h4>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Strongly Disagree</span>
                  <div className="flex space-x-3">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleBubbleClick('q2', value)}
                        className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                          bubbleAnswers.q2 === value
                            ? 'border-primary-600 bg-primary-600 text-white'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-primary-400'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">Strongly Agree</span>
                </div>
              </div>

              {/* Question 3 */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">I'm comfortable with ambiguous or unclear tasks</h4>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Strongly Disagree</span>
                  <div className="flex space-x-3">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleBubbleClick('q3', value)}
                        className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                          bubbleAnswers.q3 === value
                            ? 'border-primary-600 bg-primary-600 text-white'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-primary-400'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">Strongly Agree</span>
                </div>
              </div>

              {/* Question 4 */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">I prefer structured, well-defined processes</h4>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Strongly Disagree</span>
                  <div className="flex space-x-3">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleBubbleClick('q4', value)}
                        className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                          bubbleAnswers.q4 === value
                            ? 'border-primary-600 bg-primary-600 text-white'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-primary-400'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">Strongly Agree</span>
                </div>
              </div>

              {/* Question 5 */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">I enjoy learning new technologies and tools</h4>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Strongly Disagree</span>
                  <div className="flex space-x-3">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleBubbleClick('q5', value)}
                        className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                          bubbleAnswers.q5 === value
                            ? 'border-primary-600 bg-primary-600 text-white'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-primary-400'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">Strongly Agree</span>
                </div>
              </div>

              {/* Question 6 */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">I work better under pressure and tight deadlines</h4>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Strongly Disagree</span>
                  <div className="flex space-x-3">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleBubbleClick('q6', value)}
                        className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                          bubbleAnswers.q6 === value
                            ? 'border-primary-600 bg-primary-600 text-white'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-primary-400'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">Strongly Agree</span>
                </div>
              </div>

              {/* Question 7 */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">I prefer creative problem-solving over following procedures</h4>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Strongly Disagree</span>
                  <div className="flex space-x-3">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleBubbleClick('q7', value)}
                        className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                          bubbleAnswers.q7 === value
                            ? 'border-primary-600 bg-primary-600 text-white'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-primary-400'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">Strongly Agree</span>
                </div>
              </div>

              {/* Question 8 */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">I enjoy mentoring and helping others grow</h4>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Strongly Disagree</span>
                  <div className="flex space-x-3">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleBubbleClick('q8', value)}
                        className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                          bubbleAnswers.q8 === value
                            ? 'border-primary-600 bg-primary-600 text-white'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-primary-400'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">Strongly Agree</span>
                </div>
              </div>

              {/* Question 9 */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">I'm motivated by challenging, complex problems</h4>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Strongly Disagree</span>
                  <div className="flex space-x-3">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleBubbleClick('q9', value)}
                        className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                          bubbleAnswers.q9 === value
                            ? 'border-primary-600 bg-primary-600 text-white'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-primary-400'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">Strongly Agree</span>
                </div>
              </div>

              {/* Question 10 */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">I value work-life balance over career advancement</h4>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Strongly Disagree</span>
                  <div className="flex space-x-3">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleBubbleClick('q10', value)}
                        className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                          bubbleAnswers.q10 === value
                            ? 'border-primary-600 bg-primary-600 text-white'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-primary-400'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">Strongly Agree</span>
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center shadow-lg">
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
                (currentStep === 1 && (!watch('name') || !watch('email') || !watch('phone') || !watch('degree') || !watch('institution'))) ||
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
              disabled={isSubmitting}
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
    </div>
  )
}

export default StudentAssessment 