import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Heart, MapPin, DollarSign, Calendar, Building, Trash2, ExternalLink } from 'lucide-react'

const SavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState([])
  const [loading, setLoading] = useState(true)

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Load saved jobs from localStorage
  useEffect(() => {
    const loadSavedJobs = () => {
      try {
        const saved = localStorage.getItem('savedJobs')
        if (saved) {
          const jobs = JSON.parse(saved)
          setSavedJobs(jobs)
        }
      } catch (error) {
        console.error('Error loading saved jobs:', error)
        toast.error('Failed to load saved jobs')
      } finally {
        setLoading(false)
      }
    }

    loadSavedJobs()
  }, [])

  // Remove job from saved list
  const removeSavedJob = (jobId) => {
    try {
      const updatedJobs = savedJobs.filter(job => job._id !== jobId)
      setSavedJobs(updatedJobs)
      localStorage.setItem('savedJobs', JSON.stringify(updatedJobs))
      toast.success('Job removed from saved list')
    } catch (error) {
      console.error('Error removing saved job:', error)
      toast.error('Failed to remove job')
    }
  }

  // Format salary display
  const formatSalary = (job) => {
    if (!job.salary?.min && !job.salary?.max) return 'Salary not specified'
    
    const min = job.salary?.min ? `₹${(job.salary.min / 100000).toFixed(1)}L` : ''
    const max = job.salary?.max ? `₹${(job.salary.max / 100000).toFixed(1)}L` : ''
    const period = job.salary?.period || 'Yearly'
    
    if (min && max) {
      return `${min} - ${max} ${period}`
    } else if (min) {
      return `${min}+ ${period}`
    } else if (max) {
      return `Up to ${max} ${period}`
    }
    return 'Salary not specified'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading saved jobs...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Saved Jobs
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Your collection of interesting job opportunities
          </p>
        </div>

        {/* Jobs List */}
        {savedJobs.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-24 h-24 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              No Saved Jobs Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
              Start exploring job opportunities and save the ones that interest you. 
              They'll appear here for easy access.
            </p>
            <Link
              to="/career-match"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              Explore Jobs
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {savedJobs.map((job) => (
              <div
                key={job._id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Job Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {job.title}
                    </h3>
                    <div className="flex items-center text-gray-600 dark:text-gray-300 mb-2">
                      <Building className="w-4 h-4 mr-2" />
                      <span className="text-sm">{job.company?.name || 'Company Name'}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeSavedJob(job._id)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                    title="Remove from saved jobs"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Job Details */}
                <div className="space-y-3 mb-6">
                  {job.location?.city && (
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="text-sm">
                        {job.location.city}, {job.location.state}
                        {job.location.type && ` • ${job.location.type}`}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <DollarSign className="w-4 h-4 mr-2" />
                    <span className="text-sm">{formatSalary(job)}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="text-sm">
                      {job.jobType || 'Full-time'} • {job.industry || 'Technology'}
                    </span>
                  </div>
                </div>

                {/* Job Description Preview */}
                {job.description && (
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                    {job.description}
                  </p>
                )}

                {/* Action Button */}
                <Link
                  to={`/job/${job._id}`}
                  className="w-full inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Details
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        {savedJobs.length > 0 && (
          <div className="mt-12 text-center">
            <p className="text-gray-600 dark:text-gray-300">
              You have <span className="font-semibold text-purple-600 dark:text-purple-400">{savedJobs.length}</span> saved job{savedJobs.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SavedJobs
