import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Search, Filter, MapPin, Building, Clock, DollarSign, Star, TrendingUp } from 'lucide-react'
import { jobAPI, fitmentAPI } from '../services/api'

const CareerMatch = () => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    industry: '',
    jobType: '',
    location: ''
  })
  const [studentPhone, setStudentPhone] = useState('')
  const [showPhoneInput, setShowPhoneInput] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchJobs()
  }, [filters])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const response = await jobAPI.getAll(filters)
      setJobs(response.data.jobs || [])
    } catch (error) {
      toast.error('Failed to fetch jobs')
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckFitment = async (jobId) => {
    if (!studentPhone) {
      setShowPhoneInput(true)
      return
    }

    try {
      const response = await fitmentAPI.calculateFitment(studentPhone, jobId)
      const fitment = response.data.fitment
      
      // Navigate to job detail with fitment data
      navigate(`/job/${jobId}`, { 
        state: { fitmentData: fitment }
      })
    } catch (error) {
      toast.error('Student not found. Please complete the assessment first.')
    }
  }

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.industry.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getMatchColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-blue-600 bg-blue-100'
    if (score >= 40) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getMatchLevel = (score) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Poor'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Career Match</h1>
        <p className="text-gray-600">Discover job opportunities that match your skills and preferences</p>
      </div>

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
                onClick={() => setShowPhoneInput(false)}
                className="btn-primary flex-1"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="card mb-6">
        <div className="grid md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search jobs..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="input-field"
            value={filters.industry}
            onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
          >
            <option value="">All Industries</option>
            <option value="Technology">Technology</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Finance">Finance</option>
            <option value="Education">Education</option>
            <option value="Marketing">Marketing</option>
            <option value="Sales">Sales</option>
          </select>

          <select
            className="input-field"
            value={filters.jobType}
            onChange={(e) => setFilters({ ...filters, jobType: e.target.value })}
          >
            <option value="">All Job Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
            <option value="Freelance">Freelance</option>
          </select>

          <select
            className="input-field"
            value={filters.location}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
          >
            <option value="">All Locations</option>
            <option value="Remote">Remote</option>
            <option value="On-site">On-site</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJobs.map((job) => (
          <div key={job._id} className="card hover:shadow-lg transition-shadow duration-200">
            <div className="space-y-4">
              {/* Job Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {job.title}
                  </h3>
                  <div className="flex items-center text-gray-600 mb-2">
                    <Building className="w-4 h-4 mr-1" />
                    <span className="text-sm">{job.company.name}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>{job.jobType}</span>
                </div>
              </div>

              {/* Job Details */}
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>
                    {job.location.type} {job.location.city && `• ${job.location.city}`}
                  </span>
                </div>

                {job.salary.min && (
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="w-4 h-4 mr-1" />
                    <span>
                      ${job.salary.min.toLocaleString()} - ${job.salary.max?.toLocaleString() || 'N/A'}
                    </span>
                  </div>
                )}

                <div className="text-sm text-gray-600">
                  <span className="font-medium">Industry:</span> {job.industry}
                </div>
              </div>

              {/* Skills */}
              {job.requirements.skills && job.requirements.skills.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Required Skills:</div>
                  <div className="flex flex-wrap gap-1">
                    {job.requirements.skills.slice(0, 3).map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                      >
                        {skill}
                      </span>
                    ))}
                    {job.requirements.skills.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        +{job.requirements.skills.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => navigate(`/job/${job.jobId}`)}
                  className="btn-primary flex-1 text-sm"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleCheckFitment(job.jobId)}
                  className="btn-outline flex-1 text-sm flex items-center justify-center"
                >
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Check Fit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredJobs.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or filters</p>
        </div>
      )}
    </div>
  )
}

export default CareerMatch 