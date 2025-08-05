import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { 
  Building, MapPin, Clock, DollarSign, Search, Filter,
  ArrowLeft, Eye, Heart, Share2, Briefcase
} from 'lucide-react'
import { jobAPI } from '../services/api'

const JobListings = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filteredJobs, setFilteredJobs] = useState([])
  const [selectedRole, setSelectedRole] = useState('')
  const [savedJobs, setSavedJobs] = useState([])

  useEffect(() => {
    const role = searchParams.get('role')
    if (role) {
      setSelectedRole(decodeURIComponent(role))
    }
    fetchJobs()
  }, [searchParams])

  useEffect(() => {
    filterJobs()
  }, [jobs, selectedRole])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const response = await jobAPI.getAll()
      setJobs(response.data.jobs || [])
    } catch (error) {
      console.error('Error fetching jobs:', error)
      toast.error('Failed to fetch jobs')
    } finally {
      setLoading(false)
    }
  }

  const filterJobs = () => {
    if (!selectedRole) {
      setFilteredJobs(jobs)
      return
    }

    const filtered = jobs.filter(job => 
      job.title.toLowerCase().includes(selectedRole.toLowerCase()) ||
      job.company.name.toLowerCase().includes(selectedRole.toLowerCase()) ||
      job.industry.toLowerCase().includes(selectedRole.toLowerCase())
    )
    setFilteredJobs(filtered)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0)
  }

  const handleSaveJob = (jobId) => {
    setSavedJobs(prev => {
      if (prev.includes(jobId)) {
        return prev.filter(id => id !== jobId)
      } else {
        return [...prev, jobId]
      }
    })
    toast.success('Job saved successfully!')
  }

  const handleShareJob = async (job) => {
    const jobUrl = `${window.location.origin}/job/${job.jobId}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: job.title,
          text: `Check out this ${job.title} position at ${job.company.name}`,
          url: jobUrl
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(jobUrl)
        toast.success('Job link copied to clipboard!')
      } catch (error) {
        console.error('Error copying to clipboard:', error)
        toast.error('Failed to copy link')
      }
    }
  }

  const handleViewJob = (jobId) => {
    navigate(`/job/${jobId}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {selectedRole ? `${selectedRole} Jobs` : 'All Jobs'}
            </h1>
            <p className="text-gray-600">
              {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found
              {selectedRole && ` for "${selectedRole}"`}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-white border border-gray-300 rounded-lg px-3 py-2">
              <Filter className="w-4 h-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">Filter</span>
            </div>
          </div>
        </div>
      </div>

      {/* Job Listings */}
      {filteredJobs.length === 0 ? (
        <div className="text-center py-12">
          <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {selectedRole ? `No ${selectedRole} jobs found` : 'No jobs found'}
          </h2>
          <p className="text-gray-600 mb-6">
            {selectedRole 
              ? `We couldn't find any jobs matching "${selectedRole}". Try searching for a different role or check back later.`
              : 'There are currently no job openings available.'
            }
          </p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Browse All Jobs
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredJobs.map((job) => (
            <div key={job._id} className="card hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-primary-600 cursor-pointer"
                          onClick={() => handleViewJob(job.jobId)}>
                        {job.title}
                      </h3>
                      <div className="flex items-center text-gray-600 mb-2">
                        <Building className="w-4 h-4 mr-2" />
                        <span className="font-medium">{job.company.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                        {job.jobType}
                      </span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>
                        {job.location.type === 'Remote' ? 'Remote' : 
                         `${job.location.city || ''}, ${job.location.state || ''}, ${job.location.country || ''}`}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{job.industry}</span>
                    </div>
                    {job.salary?.min && (
                      <div className="flex items-center text-gray-600">
                        <DollarSign className="w-4 h-4 mr-2" />
                        <span>
                          {formatCurrency(job.salary.min)} - {formatCurrency(job.salary.max)} {job.salary.period}
                        </span>
                      </div>
                    )}
                  </div>

                  <p className="text-gray-700 line-clamp-2 mb-4">
                    {job.description.substring(0, 200)}...
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        Posted {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewJob(job.jobId)}
                        className="btn-primary text-sm py-2 px-4"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </button>
                      <button
                        onClick={() => handleSaveJob(job._id)}
                        className={`p-2 rounded-lg transition-colors ${
                          savedJobs.includes(job._id)
                            ? 'text-red-500 bg-red-50 hover:bg-red-100'
                            : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${savedJobs.includes(job._id) ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        onClick={() => handleShareJob(job)}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default JobListings 