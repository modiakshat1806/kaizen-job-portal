import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { ChevronLeft, ChevronRight, Check, User, Heart, Target, MapPin } from 'lucide-react'
import { studentAPI, fitmentAPI } from '../services/api'

const StudentAssessment = () => {
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
      
      // 2. GET fitment results from /api/fitment/:studentPhone
      const matchedJobsResponse = await fitmentAPI.getMatchedJobs(data.phone, {
        limit: 20,
        minScore: 30 // Only show jobs with at least 30% match
      })
      
      // 3. Navigate to /career-match with the job match results passed in state
      navigate('/career-match', {
        state: {
          jobs: matchedJobsResponse.data.matchedJobs,
          student: matchedJobsResponse.data.student,
          totalJobs: matchedJobsResponse.data.totalJobs,
          averageScore: matchedJobsResponse.data.averageScore,
          fromAssessment: true
        }
      })
    } catch (error) {
      console.error('Assessment submission error:', error)
      if (error.response?.status === 404) {
        toast.error('Failed to find matched jobs. Please try again.')
      } else if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.error || 'Validation failed'
        toast.error(errorMessage)
      } else {
        toast.error(error.response?.data?.error || 'Failed to save assessment')
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
            
            <div className="grid md:grid-cols-2 gap-6">
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
                  <select className="input-field" {...register('degree', { required: 'Degree is required' })}>
                    <option value="">Select Degree</option>
                    <option value="BE">BE</option>
                    <option value="BTech">BTech</option>
                    <option value="MSc">MSc</option>
                    <option value="MTech">MTech</option>
                    <option value="MBA">MBA</option>
                    <option value="BBA">BBA</option>
                    <option value="BCom">BCom</option>
                    <option value="BCA">BCA</option>
                    <option value="MCA">MCA</option>
                  </select>
                </div>
                {errors.degree && <p className="form-error">{errors.degree.message}</p>}
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
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                   </div>
                  <div className="text-center text-sm font-medium text-gray-700">
                    Current Value: {sliderValues.independence}
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
                   </div>
                  <div className="text-center text-sm font-medium text-gray-700">
                    Current Value: {sliderValues.routine}
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
                   </div>
                  <div className="text-center text-sm font-medium text-gray-700">
                    Current Value: {sliderValues.pace}
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
                   </div>
                  <div className="text-center text-sm font-medium text-gray-700">
                    Current Value: {sliderValues.focus}
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
                   </div>
                  <div className="text-center text-sm font-medium text-gray-700">
                    Current Value: {sliderValues.approach}
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
              <h3 className="text-xl font-semibold">Work Style Assessment</h3>
            </div>
            <p className="text-gray-600 mb-6">Please rate how much you agree with each statement by selecting one bubble for each question.</p>
            
            <div className="space-y-8">
              {/* Question 1 */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">I prefer working in a team rather than alone</h4>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Strongly Disagree</span>
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
                  <span className="text-sm text-gray-600">Strongly Agree</span>
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
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Assessment</h1>
        <p className="text-gray-600">Complete this assessment to help us match you with the best opportunities</p>
        
        {/* Show saved progress indicator */}
        {currentStep > 1 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-blue-700 font-medium">
                  Progress saved • You're on step {currentStep} of {steps.length}
                </span>
              </div>
              <button
                type="button"
                onClick={resetAssessment}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Start Over
              </button>
            </div>
          </div>
        )}
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
    </div>
  )
}

export default StudentAssessment 