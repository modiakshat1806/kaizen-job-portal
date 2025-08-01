import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { ChevronLeft, ChevronRight, Check, User, GraduationCap, Briefcase, Target, MapPin } from 'lucide-react'
import { studentAPI } from '../services/api'

const StudentAssessment = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  
  const { register, handleSubmit, watch, formState: { errors }, setValue } = useForm()
  
  const steps = [
    { id: 1, title: 'Personal Info', icon: User },
    { id: 2, title: 'Education', icon: GraduationCap },
    { id: 3, title: 'Experience', icon: Briefcase },
    { id: 4, title: 'Skills & Goals', icon: Target },
    { id: 5, title: 'Preferences', icon: MapPin }
  ]

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      // Calculate assessment scores based on form data
      const assessmentScore = calculateAssessmentScore(data)
      
      const studentData = {
        ...data,
        assessmentScore,
        skills: data.skills ? data.skills.split(',').map(skill => ({
          name: skill.trim(),
          level: 'Intermediate'
        })) : [],
        interests: data.interests ? data.interests.split(',').map(interest => interest.trim()) : [],
        preferredLocation: data.preferredLocation ? data.preferredLocation.split(',').map(location => location.trim()) : [],
        experience: {
          years: parseInt(data.experienceYears) || 0,
          internships: [],
          projects: []
        }
      }

      await studentAPI.saveAssessment(studentData)
      toast.success('Assessment completed successfully!')
      navigate('/career-match')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save assessment')
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
    technical += educationLevels[data.education?.degree] || 0

    // Adjust based on experience
    const expYears = parseInt(data.experienceYears) || 0
    technical += Math.min(expYears * 5, 30)
    communication += Math.min(expYears * 3, 20)

    // Cap scores at 100
    return {
      technical: Math.min(technical, 100),
      communication: Math.min(communication, 100),
      problemSolving: Math.min(problemSolving, 100),
      teamwork: Math.min(teamwork, 100)
    }
  }

  const nextStep = () => {
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
            <h3 className="text-xl font-semibold mb-6">Personal Information</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="input-field"
                  {...register('name', { required: 'Name is required' })}
                />
                {errors.name && <p className="form-error">{errors.name.message}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className="input-field"
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
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="input-field"
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
            </div>
          </div>
        )

      case 2:
        return (
          <div className="form-section">
            <h3 className="text-xl font-semibold mb-6">Education Background</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="form-group">
                <label className="form-label">Degree Level</label>
                <select className="input-field" {...register('education.degree', { required: 'Degree is required' })}>
                  <option value="">Select Degree</option>
                  <option value="High School">High School</option>
                  <option value="Bachelor">Bachelor's Degree</option>
                  <option value="Master">Master's Degree</option>
                  <option value="PhD">PhD</option>
                  <option value="Diploma">Diploma</option>
                  <option value="Other">Other</option>
                </select>
                {errors.education?.degree && <p className="form-error">{errors.education.degree.message}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Field of Study</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g., Computer Science, Business"
                  {...register('education.field', { required: 'Field of study is required' })}
                />
                {errors.education?.field && <p className="form-error">{errors.education.field.message}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Institution</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="University/College name"
                  {...register('education.institution', { required: 'Institution is required' })}
                />
                {errors.education?.institution && <p className="form-error">{errors.education.institution.message}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Graduation Year</label>
                <input
                  type="number"
                  className="input-field"
                  min="1950"
                  max={new Date().getFullYear() + 10}
                  {...register('education.graduationYear', { 
                    required: 'Graduation year is required',
                    min: { value: 1950, message: 'Invalid year' },
                    max: { value: new Date().getFullYear() + 10, message: 'Invalid year' }
                  })}
                />
                {errors.education?.graduationYear && <p className="form-error">{errors.education.graduationYear.message}</p>}
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="form-section">
            <h3 className="text-xl font-semibold mb-6">Work Experience</h3>
            
            <div className="space-y-6">
              <div className="form-group">
                <label className="form-label">Years of Experience</label>
                <input
                  type="number"
                  className="input-field"
                  min="0"
                  max="50"
                  placeholder="0"
                  {...register('experienceYears', { 
                    min: { value: 0, message: 'Experience cannot be negative' },
                    max: { value: 50, message: 'Please enter a valid experience' }
                  })}
                />
                {errors.experienceYears && <p className="form-error">{errors.experienceYears.message}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Skills (comma-separated)</label>
                <textarea
                  className="input-field"
                  rows="3"
                  placeholder="e.g., JavaScript, React, Python, Communication"
                  {...register('skills')}
                />
                <p className="text-sm text-gray-500">List your technical and soft skills</p>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="form-section">
            <h3 className="text-xl font-semibold mb-6">Career Goals & Interests</h3>
            
            <div className="space-y-6">
              <div className="form-group">
                <label className="form-label">Career Goals</label>
                <textarea
                  className="input-field"
                  rows="4"
                  placeholder="Describe your career goals and aspirations..."
                  {...register('careerGoals', { required: 'Career goals are required' })}
                />
                {errors.careerGoals && <p className="form-error">{errors.careerGoals.message}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Interests (comma-separated)</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g., AI, Web Development, Data Science"
                  {...register('interests')}
                />
                <p className="text-sm text-gray-500">What areas interest you most?</p>
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="form-section">
            <h3 className="text-xl font-semibold mb-6">Job Preferences</h3>
            
            <div className="space-y-6">
              <div className="form-group">
                <label className="form-label">Preferred Locations (comma-separated)</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g., New York, Remote, San Francisco"
                  {...register('preferredLocation')}
                />
                <p className="text-sm text-gray-500">Where would you like to work?</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label className="form-label">Minimum Salary (USD)</label>
                  <input
                    type="number"
                    className="input-field"
                    min="0"
                    placeholder="30000"
                    {...register('salaryExpectation.min', { min: 0 })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Maximum Salary (USD)</label>
                  <input
                    type="number"
                    className="input-field"
                    min="0"
                    placeholder="80000"
                    {...register('salaryExpectation.max', { min: 0 })}
                  />
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
              className="btn-primary flex items-center space-x-2"
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
                  <span>Complete Assessment</span>
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