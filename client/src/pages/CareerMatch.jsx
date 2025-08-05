import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Search, Filter, MapPin, Building, Clock, DollarSign, Star, TrendingUp, User } from 'lucide-react'
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
  const [matchedJobs, setMatchedJobs] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [student, setStudent] = useState(null)
  const [fromAssessment, setFromAssessment] = useState(false)
  const [isAIRecommendations, setIsAIRecommendations] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Check if we have data from assessment submission
    if (location.state?.fromAssessment) {
      try {
        const student = location.state.student

        // Validate that we have the required data
        if (!student || !student.name || !student.phone) {
          console.error('Invalid student data received:', student)
          toast.error('Invalid student data received')
          fetchJobs()
          return
        }

        setStudent(student)
        setFromAssessment(true)
        setLoading(false)

        // Check if we have AI recommendations or traditional job matches
        if (location.state.recommendations) {
          // New AI recommendations format
          setRecommendations(location.state.recommendations)
          setIsAIRecommendations(true)
          toast.success(`Generated ${location.state.totalRecommendations || location.state.recommendations.length} AI-powered job recommendations!`)
        } else if (location.state.jobs) {
          // Legacy job matches format
          setMatchedJobs(location.state.jobs)
          setIsAIRecommendations(false)
          if (location.state.jobs.length > 0) {
            toast.success(`Found ${location.state.totalJobs || location.state.jobs.length} matched jobs for you!`)
          } else {
            toast.info('No matching jobs found for your profile')
          }
        } else {
          toast.info('No recommendations available')
        }
      } catch (error) {
        console.error('Error processing assessment data:', error)
        toast.error('Error processing assessment data')
        fetchJobs()
      }
    } else {
      fetchJobs()
    }
  }, [filters, location.state])

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

  const filteredJobs = (fromAssessment ? (matchedJobs || []) : (jobs || [])).filter(job => {
    // Validate job structure
    if (!job || !job.title || !job.company || !job.industry) {
      console.warn('Invalid job data found:', job)
      return false
    }
    
    // Check if job has required nested properties
    if (!job.company.name) {
      console.warn('Job missing company name:', job)
      return false
    }
    
    const searchLower = searchTerm.toLowerCase()
    return (
      job.title.toLowerCase().includes(searchLower) ||
      job.company.name.toLowerCase().includes(searchLower) ||
      job.industry.toLowerCase().includes(searchLower)
    )
  })

  const getMatchColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-secondary-600 bg-secondary-100'
    if (score >= 40) return 'text-primary-600 bg-primary-100'
    return 'text-red-600 bg-red-100'
  }

  const getMatchLevel = (score) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Poor'
  }

  const clearAssessmentView = () => {
    setFromAssessment(false)
    setMatchedJobs([])
    setRecommendations([])
    setStudent(null)
    setIsAIRecommendations(false)
    fetchJobs()
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
        {fromAssessment && student ? (
          <div className="space-y-2">
            <p className="text-gray-600 dark:text-gray-300">
              {isAIRecommendations
                ? `🤖 AI-powered career recommendations for ${student.name}`
                : `Personalized job recommendations for ${student.name}`
              }
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-1" />
                <span>{student.phone}</span>
              </div>
              {isAIRecommendations ? (
                <div className="flex items-center">
                  <Star className="w-4 h-4 mr-1" />
                  <span>{recommendations.length} AI Recommendations</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <Star className="w-4 h-4 mr-1" />
                  <span>Average Match: {location.state?.averageScore || 0}%</span>
                </div>
              )}
              {location.state?.generatedAt && (
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>Generated: {new Date(location.state.generatedAt).toLocaleTimeString()}</span>
                </div>
              )}
            </div>
            <button
              onClick={clearAssessmentView}
              className="btn-outline text-sm mt-2"
            >
              View All Jobs
            </button>
          </div>
        ) : (
          <p className="text-gray-600">Discover job opportunities that match your skills and preferences</p>
        )}
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

      {/* Search and Filters - Only show for traditional job listings */}
      {!isAIRecommendations && (
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
      )}

      {/* Jobs Grid - Only show for traditional job listings */}
      {!isAIRecommendations && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
         {filteredJobs.map((job) => {
           // Additional safety check for rendering
           if (!job || !job.title || !job.company || !job.company.name) {
             console.warn('Skipping invalid job for rendering:', job)
             return null
           }
           
           return (
             <div key={job._id || job.jobId || Math.random()} className="card hover:shadow-lg transition-shadow duration-200">
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
                 <div className="flex items-center space-x-2">
                   {fromAssessment && job.fitment && (
                     <div className={`px-2 py-1 rounded text-xs font-medium ${getMatchColor(job.fitment.score)}`}>
                       {job.fitment.score}% Match
                     </div>
                   )}
                   <div className="flex items-center space-x-1 text-sm text-gray-500">
                     <Clock className="w-4 h-4" />
                     <span>{job.jobType}</span>
                   </div>
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

                {job.salary && job.salary.min && (
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
              {job.requirements && job.requirements.skills && job.requirements.skills.length > 0 && (
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
                                 {fromAssessment && job.fitment ? (
                   <button
                     onClick={() => navigate(`/job/${job.jobId}`, { 
                       state: { fitmentData: job.fitment }
                     })}
                     className="btn-outline flex-1 text-sm flex items-center justify-center"
                   >
                     <TrendingUp className="w-4 h-4 mr-1" />
                     View Match
                   </button>
                 ) : (
                   <button
                     onClick={() => handleCheckFitment(job.jobId)}
                     className="btn-outline flex-1 text-sm flex items-center justify-center"
                   >
                     <TrendingUp className="w-4 h-4 mr-1" />
                     Check Fit
                   </button>
                 )}
                             </div>
             </div>
           </div>
         )
       })}
       </div>
      )}

      {/* AI Recommendations Flash Cards */}
      {isAIRecommendations && recommendations.length > 0 && (
        <div className="mt-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              🤖 AI-Powered Career Recommendations
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Based on your assessment, here are the best career matches for you
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((recommendation, index) => (
              <div
                key={index}
                onClick={() => {
                  // Navigate to jobs page filtered by this role
                  navigate(`/jobs?role=${encodeURIComponent(recommendation.jobTitle)}`)
                }}
                className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                {/* Card Header with Logo and Score */}
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div className="text-3xl">{recommendation.relevantLogo}</div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                      <span className="text-sm font-bold">{recommendation.fitmentScore}% Match</span>
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-purple-600 transition-colors">
                    {recommendation.jobTitle}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 leading-relaxed">
                    {recommendation.jobDescription}
                  </p>

                  {/* Why You Match */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Why you're a great fit:</h4>
                    <ul className="space-y-1">
                      {recommendation.whyYouMatch.map((reason, reasonIndex) => (
                        <li key={reasonIndex} className="text-xs text-gray-600 dark:text-gray-400 flex items-start">
                          <span className="text-green-500 mr-2 mt-0.5">•</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Available Jobs Count */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Building className="w-4 h-4 mr-1" />
                      <span>{recommendation.availableJobs || 0} positions available</span>
                    </div>
                    <div className="text-purple-600 group-hover:text-purple-700 transition-colors">
                      <span className="text-sm font-medium">View Jobs →</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Fallback UI for different scenarios */}
      {filteredJobs.length === 0 && recommendations.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            {fromAssessment ? (
              <div className="space-y-2">
                <div className="w-16 h-16 mx-auto mb-2">
                  <svg className="w-full h-full text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500">No matching jobs found for your profile</p>
              </div>
            ) : (
              <Search className="w-16 h-16 mx-auto" />
            )}
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {fromAssessment ? 'No Matching Jobs Found' : 'No Jobs Found'}
          </h3>
          
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {fromAssessment ? (
              "We couldn't find any jobs that match your current profile. This might be due to your location preferences, experience level, or skill requirements."
            ) : (
              "Try adjusting your search criteria or filters to find more opportunities."
            )}
          </p>
          
          <div className="space-y-3">
            {fromAssessment && (
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => navigate('/student-assessment')}
                  className="btn-primary text-sm"
                >
                  Update Assessment
                </button>
                <button
                  onClick={clearAssessmentView}
                  className="btn-outline text-sm"
                >
                  View All Jobs
                </button>
              </div>
            )}
            
            {!fromAssessment && (
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => navigate('/student-assessment')}
                  className="btn-primary text-sm"
                >
                  Complete Assessment
                </button>
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setFilters({ industry: '', jobType: '', location: '' })
                  }}
                  className="btn-outline text-sm"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
          
          {fromAssessment && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg max-w-md mx-auto">
              <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Tips to improve your matches:</h4>
              <ul className="text-xs text-blue-800 space-y-1 text-left">
                <li>• Update your skills and experience</li>
                <li>• Consider expanding your location preferences</li>
                <li>• Complete the full assessment with detailed information</li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CareerMatch 