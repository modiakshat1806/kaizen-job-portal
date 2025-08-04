import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  Building, MapPin, Clock, DollarSign, Users, FileText,
  Star, TrendingUp, ArrowLeft, CheckCircle, XCircle,
  GraduationCap, Briefcase, Target, Award
} from 'lucide-react'
import { jobAPI, fitmentAPI, studentAPI } from '../services/api'

const JobDetail = () => {
  const { jobId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fitmentData, setFitmentData] = useState(location.state?.fitmentData || null)
  const [studentPhone, setStudentPhone] = useState('')
  const [showPhoneInput, setShowPhoneInput] = useState(false)
  const [showNewUserModal, setShowNewUserModal] = useState(false)
  const [isJobSaved, setIsJobSaved] = useState(false)

  // Check if accessed via QR code (no referrer or direct access)
  const isQRAccess = !document.referrer || document.referrer === '' ||
                     location.state?.fromQR === true

  useEffect(() => {
    fetchJob()
    checkIfJobSaved()

    // Check if returning from assessment
    if (location.state?.fromAssessment && location.state?.studentPhone) {
      setStudentPhone(location.state.studentPhone)
      // Auto-calculate fitment after a short delay
      setTimeout(() => {
        handleCheckFitmentWithPhone(location.state.studentPhone)
      }, 1000)
    }
  }, [jobId])

  // Check if job is already saved
  const checkIfJobSaved = () => {
    try {
      const savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]')
      const isSaved = savedJobs.some(savedJob => savedJob._id === jobId)
      setIsJobSaved(isSaved)
    } catch (error) {
      console.error('Error checking saved jobs:', error)
    }
  }

  // Save or unsave job
  const toggleSaveJob = () => {
    try {
      const savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]')

      if (isJobSaved) {
        // Remove from saved jobs
        const updatedJobs = savedJobs.filter(savedJob => savedJob._id !== jobId)
        localStorage.setItem('savedJobs', JSON.stringify(updatedJobs))
        setIsJobSaved(false)
        toast.success('Job removed from saved list')
      } else {
        // Add to saved jobs
        if (job) {
          const updatedJobs = [...savedJobs, job]
          localStorage.setItem('savedJobs', JSON.stringify(updatedJobs))
          setIsJobSaved(true)
          toast.success('Job saved successfully!')
        }
      }
    } catch (error) {
      console.error('Error saving job:', error)
      toast.error('Failed to save job')
    }
  }

  const fetchJob = async () => {
    try {
      setLoading(true)
      const response = await jobAPI.getById(jobId)
      setJob(response.data.job)
    } catch (error) {
      toast.error('Failed to fetch job details')
      console.error('Error fetching job:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckFitmentWithPhone = async (phone) => {
    try {
      // First check if student exists
      const studentResponse = await studentAPI.getByPhone(phone)

      if (studentResponse.data.student) {
        // Student exists, calculate fitment
        const response = await fitmentAPI.calculateFitment(phone, jobId)
        setFitmentData(response.data.fitment)
        toast.success('Fitment calculated successfully!')
      }
    } catch (error) {
      if (error.response?.status === 404) {
        // Student not found, show new user modal
        setShowNewUserModal(true)
        setShowPhoneInput(false)
      } else {
        toast.error('Error checking fitment. Please try again.')
      }
    }
  }

  const handleCheckFitment = async () => {
    if (!studentPhone) {
      setShowPhoneInput(true)
      return
    }

    await handleCheckFitmentWithPhone(studentPhone)
  }

  const handleTakeAssessment = () => {
    // Store current job info in localStorage to return after assessment
    localStorage.setItem('returnToJob', JSON.stringify({
      jobId: jobId,
      phone: studentPhone
    }))

    // Navigate to assessment
    navigate('/assessment')
  }

  const getMatchColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-secondary-600 bg-secondary-100'
    if (score >= 40) return 'text-primary-600 bg-primary-100'
    return 'text-red-600 bg-red-100'
  }

  const getMatchLevel = (score) => {
    if (score >= 80) return 'Excellent Match'
    if (score >= 60) return 'Good Match'
    if (score >= 40) return 'Fair Match'
    return 'Poor Match'
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Job not found</h2>
        <p className="text-gray-600">The job you're looking for doesn't exist or has been removed.</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Phone Input Modal */}
      {showPhoneInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Enter Your Phone Number</h3>
            <p className="text-gray-600 mb-4">
              Please enter the phone number you used during assessment to check your fitment score.
            </p>
            <input
              type="tel"
              className="input-field mb-4"
              placeholder="Enter your phone number"
              value={studentPhone}
              onChange={(e) => setStudentPhone(e.target.value)}
            />
            <div className="flex space-x-3">
              <button
                onClick={() => setShowPhoneInput(false)}
                className="btn-outline flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowPhoneInput(false)
                  handleCheckFitment()
                }}
                className="btn-primary flex-1"
              >
                Check Fitment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New User Modal */}
      {showNewUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">New Phone Number Detected</h3>
            <p className="text-gray-600 mb-4">
              We couldn't find an assessment record for this phone number. Please take our assessment test first to get your fitment score.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowNewUserModal(false)
                  setStudentPhone('')
                }}
                className="btn-outline flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleTakeAssessment}
                className="btn-primary flex-1"
              >
                Take Assessment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Header */}
          <div className="card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                <div className="flex items-center text-gray-600 mb-4">
                  <Building className="w-5 h-5 mr-2" />
                  <span className="text-lg">{job.company.name}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                  {job.jobType}
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center text-gray-600">
                <MapPin className="w-4 h-4 mr-2" />
                <span>{job.location.type} {job.location.city && `• ${job.location.city}`}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                <span>{job.industry}</span>
              </div>
              {job.salary.min && !isQRAccess && (
                <div className="flex items-center text-gray-600">
                  <DollarSign className="w-4 h-4 mr-2" />
                  <span>{formatCurrency(job.salary.min)} - {formatCurrency(job.salary.max)} {job.salary.period}</span>
                </div>
              )}
              {job.salary.min && isQRAccess && !fitmentData && (
                <div className="flex items-center text-gray-600">
                  <DollarSign className="w-4 h-4 mr-2" />
                  <span>Salary details available after fitment check</span>
                </div>
              )}
              {job.salary.min && isQRAccess && fitmentData && (
                <div className="flex items-center text-gray-600">
                  <DollarSign className="w-4 h-4 mr-2" />
                  <span>{formatCurrency(job.salary.min)} - {formatCurrency(job.salary.max)} {job.salary.period}</span>
                </div>
              )}
            </div>

            <div className="prose max-w-none">
              <h3 className="text-lg font-semibold mb-3">Job Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
            </div>
          </div>

          {/* Requirements */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Requirements
            </h2>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Education</h3>
                <div className="flex items-center text-gray-600">
                  <GraduationCap className="w-4 h-4 mr-2" />
                  <span>{job.requirements.education}</span>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">Experience</h3>
                <div className="flex items-center text-gray-600">
                  <Briefcase className="w-4 h-4 mr-2" />
                  <span>{job.requirements.experience.min}+ years</span>
                </div>
              </div>
            </div>

            {job.requirements.skills && job.requirements.skills.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.requirements.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Responsibilities */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Responsibilities
              </h2>
              <ul className="space-y-2">
                {job.responsibilities.map((responsibility, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{responsibility}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Benefits */}
          {job.benefits && job.benefits.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2" />
                Benefits
              </h2>
              <ul className="space-y-2">
                {job.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <Star className="w-4 h-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Fitment Score */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Your Fitment Score
            </h3>

            {fitmentData ? (
              <div className="space-y-4">
                <div className="text-center">
                  <div className={`text-4xl font-bold mb-2 ${getMatchColor(fitmentData.score)}`}>
                    {fitmentData.score}%
                  </div>
                  <div className="text-lg font-medium text-gray-900 mb-2">
                    {getMatchLevel(fitmentData.score)}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${fitmentData.score}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Analysis</h4>
                    <ul className="space-y-2">
                      {fitmentData.reasons.map((reason, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {fitmentData.strengths && fitmentData.strengths.length > 0 && (
                    <div>
                      <h4 className="font-medium text-green-700 mb-2">Your Strengths</h4>
                      <ul className="space-y-1">
                        {fitmentData.strengths.map((strength, index) => (
                          <li key={index} className="text-sm text-green-600 flex items-start">
                            <Star className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {fitmentData.improvements && fitmentData.improvements.length > 0 && (
                    <div>
                      <h4 className="font-medium text-orange-700 mb-2">Areas for Growth</h4>
                      <ul className="space-y-1">
                        {fitmentData.improvements.map((improvement, index) => (
                          <li key={index} className="text-sm text-orange-600 flex items-start">
                            <TrendingUp className="w-4 h-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span>{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {fitmentData.aiGenerated && (
                    <div className="text-xs text-gray-500 italic border-t pt-2">
                      Analysis powered by AI
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="text-gray-400 mb-4">
                  <Target className="w-12 h-12 mx-auto" />
                </div>
                <p className="text-gray-600 mb-4">
                  Check how well this job matches your profile
                </p>
                <button
                  onClick={handleCheckFitment}
                  className="btn-primary w-full"
                >
                  Check Fitment
                </button>
              </div>
            )}
          </div>

          {/* Quick Actions - Hidden for QR access until fitment check */}
          {(!isQRAccess || fitmentData) && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="btn-primary w-full">
                  Apply Now
                </button>
                <button
                  onClick={toggleSaveJob}
                  className={`w-full font-semibold py-2 px-4 rounded-lg transition-all duration-300 ${
                    isJobSaved
                      ? 'bg-green-100 text-green-700 border border-green-300 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700 dark:hover:bg-green-900/30'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700'
                  }`}
                >
                  {isJobSaved ? '✓ Saved' : 'Save Job'}
                </button>
                <button className="btn-outline w-full">
                  Share Job
                </button>
              </div>
            </div>
          )}

          {/* Company Info */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">About {job.company.name}</h3>
            <div className="space-y-3">
              <div className="flex items-center text-gray-600">
                <Building className="w-4 h-4 mr-2" />
                <span>{job.industry} Industry</span>
              </div>
              {job.company.website && (
                <div className="flex items-center text-gray-600">
                  <span className="text-primary-600 hover:text-primary-700 cursor-pointer">
                    Visit Website
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default JobDetail 