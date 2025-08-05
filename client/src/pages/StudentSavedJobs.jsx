import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  Phone, Star, Building, MapPin, DollarSign,
  Calendar, Briefcase, Trash2, Eye, ArrowLeft,
  User, Bookmark
} from 'lucide-react'
import { jobApplicationAPI } from '../services/api'

const StudentSavedJobs = () => {
  const navigate = useNavigate()
  const [showPhoneInput, setShowPhoneInput] = useState(true)
  const [studentPhone, setStudentPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [savedJobs, setSavedJobs] = useState([])
  const [removing, setRemoving] = useState(null)

  const handlePhoneSubmit = async () => {
    if (!studentPhone.trim()) {
      toast.error('Please enter your phone number')
      return
    }

    // Basic phone validation
    const phoneRegex = /^[0-9]{10}$/
    if (!phoneRegex.test(studentPhone.replace(/\D/g, ''))) {
      toast.error('Please enter a valid 10-digit phone number')
      return
    }

    setLoading(true)
    try {
      const response = await jobApplicationAPI.getSavedJobs(studentPhone.trim())
      setSavedJobs(response.data.savedJobs)
      setShowPhoneInput(false)
      
      if (response.data.count === 0) {
        toast.info('No saved jobs found for this phone number')
      } else {
        toast.success(`Found ${response.data.count} saved jobs`)
      }
    } catch (error) {
      console.error('Error fetching saved jobs:', error)
      toast.error('Failed to fetch saved jobs. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveJob = async (jobId, jobTitle) => {
    if (!confirm(`Are you sure you want to remove "${jobTitle}" from your saved jobs?`)) {
      return
    }

    setRemoving(jobId)
    try {
      await jobApplicationAPI.removeSavedJob(studentPhone, jobId)
      setSavedJobs(savedJobs.filter(job => job.jobId !== jobId))
      toast.success(`"${jobTitle}" removed from saved jobs`)
    } catch (error) {
      console.error('Error removing saved job:', error)
      toast.error('Failed to remove job. Please try again.')
    } finally {
      setRemoving(null)
    }
  }

  const handleViewJob = (jobId) => {
    navigate(`/job/${jobId}`)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const resetSearch = () => {
    setShowPhoneInput(true)
    setStudentPhone('')
    setSavedJobs([])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Phone Input Modal */}
        {showPhoneInput && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Star className="w-6 h-6 mr-2 text-yellow-500" />
                Your Saved Jobs
              </h3>
              <p className="text-gray-600 mb-4">
                Enter your phone number to view all the jobs you've saved.
              </p>
              <input
                type="tel"
                className="input-field mb-4"
                placeholder="Enter your phone number"
                value={studentPhone}
                onChange={(e) => setStudentPhone(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handlePhoneSubmit()}
              />
              <div className="flex space-x-3">
                <button
                  onClick={() => window.history.back()}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePhoneSubmit}
                  disabled={loading || !studentPhone.trim()}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Loading...' : 'View Saved Jobs'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results Header */}
        {!showPhoneInput && (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Your Saved Jobs
                </h1>
                <p className="text-gray-600">
                  {savedJobs.length} saved opportunities for {studentPhone}
                </p>
              </div>
              <button
                onClick={resetSearch}
                className="btn-outline flex items-center"
              >
                <Phone className="w-4 h-4 mr-2" />
                Different Number
              </button>
            </div>

            {/* Saved Jobs Grid */}
            {savedJobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedJobs.map((savedJob) => (
                  <div
                    key={savedJob._id}
                    className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {savedJob.jobTitle}
                        </h3>
                        <div className="flex items-center text-gray-600 mb-2">
                          <Building className="w-4 h-4 mr-1" />
                          <span className="text-sm">{savedJob.companyName}</span>
                        </div>
                      </div>
                      <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    </div>

                    {savedJob.jobDetails && (
                      <div className="space-y-2 mb-4">
                        {savedJob.jobDetails.location && (
                          <div className="flex items-center text-gray-600 text-sm">
                            <MapPin className="w-4 h-4 mr-2" />
                            <span>{savedJob.jobDetails.location}</span>
                          </div>
                        )}
                        
                        {savedJob.jobDetails.salary?.min && (
                          <div className="flex items-center text-gray-600 text-sm">
                            <DollarSign className="w-4 h-4 mr-2" />
                            <span>
                              {formatCurrency(savedJob.jobDetails.salary.min)} - {formatCurrency(savedJob.jobDetails.salary.max)} {savedJob.jobDetails.salary.period}
                            </span>
                          </div>
                        )}

                        {savedJob.jobDetails.jobType && (
                          <div className="flex items-center text-gray-600 text-sm">
                            <Briefcase className="w-4 h-4 mr-2" />
                            <span>{savedJob.jobDetails.jobType}</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>Saved {formatDate(savedJob.savedAt)}</span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewJob(savedJob.jobId)}
                        className="btn-primary flex-1 text-sm py-2 flex items-center justify-center"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Job
                      </button>
                      <button
                        onClick={() => handleRemoveJob(savedJob.jobId, savedJob.jobTitle)}
                        disabled={removing === savedJob.jobId}
                        className="btn-outline text-sm py-2 px-3 flex items-center justify-center disabled:opacity-50"
                      >
                        {removing === savedJob.jobId ? (
                          <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Bookmark className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Saved Jobs</h2>
                <p className="text-gray-600 mb-4">
                  You haven't saved any jobs yet. Start exploring opportunities and save the ones that interest you!
                </p>
                <button
                  onClick={() => navigate('/jobs')}
                  className="btn-primary"
                >
                  Browse Jobs
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default StudentSavedJobs
