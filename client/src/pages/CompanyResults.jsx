import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { 
  Building, User, Phone, Mail, GraduationCap, 
  Star, TrendingUp, Calendar, MapPin, Briefcase,
  Search, X, CheckCircle, Clock, Award
} from 'lucide-react'
import { jobApplicationAPI } from '../services/api'

const CompanyResults = () => {
  const [showCompanyInput, setShowCompanyInput] = useState(true)
  const [companyName, setCompanyName] = useState('')
  const [loading, setLoading] = useState(false)
  const [applications, setApplications] = useState([])
  const [applicationsByJob, setApplicationsByJob] = useState([])
  const [totalApplications, setTotalApplications] = useState(0)

  const handleCompanySubmit = async () => {
    if (!companyName.trim()) {
      toast.error('Please enter a company name')
      return
    }

    setLoading(true)
    try {
      const response = await jobApplicationAPI.getCompanyApplications(companyName.trim())
      setApplications(response.data.allApplications)
      setApplicationsByJob(response.data.applicationsByJob)
      setTotalApplications(response.data.totalApplications)
      setShowCompanyInput(false)
      
      if (response.data.totalApplications === 0) {
        toast.info(`No applications found for "${companyName}"`)
      } else {
        toast.success(`Found ${response.data.totalApplications} applications for "${companyName}"`)
      }
    } catch (error) {
      console.error('Error fetching company applications:', error)
      toast.error('Failed to fetch applications. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getFitmentColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-blue-600 bg-blue-100'
    if (score >= 40) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getFitmentText = (score) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Poor'
  }

  const resetSearch = () => {
    setShowCompanyInput(true)
    setCompanyName('')
    setApplications([])
    setApplicationsByJob([])
    setTotalApplications(0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Company Input Modal */}
        {showCompanyInput && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Building className="w-6 h-6 mr-2 text-blue-600" />
                Company Results
              </h3>
              <p className="text-gray-600 mb-4">
                Enter your company name to view all student applications for your job postings.
              </p>
              <input
                type="text"
                className="input-field mb-4"
                placeholder="Enter company name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCompanySubmit()}
              />
              <div className="flex space-x-3">
                <button
                  onClick={() => window.history.back()}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCompanySubmit}
                  disabled={loading || !companyName.trim()}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Searching...' : 'View Results'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results Header */}
        {!showCompanyInput && (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Applications for {companyName}
                </h1>
                <p className="text-gray-600">
                  {totalApplications} total applications across all job postings
                </p>
              </div>
              <button
                onClick={resetSearch}
                className="btn-outline flex items-center"
              >
                <Search className="w-4 h-4 mr-2" />
                Search Another Company
              </button>
            </div>

            {/* Applications by Job */}
            {applicationsByJob.length > 0 ? (
              <div className="space-y-6">
                {applicationsByJob.map((jobGroup, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                        <Briefcase className="w-5 h-5 mr-2 text-blue-600" />
                        {jobGroup.jobTitle}
                      </h2>
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {jobGroup.applications.length} applications
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {jobGroup.applications.map((application) => (
                        <div
                          key={application._id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center">
                              <User className="w-8 h-8 text-gray-400 mr-3" />
                              <div>
                                <h3 className="font-semibold text-gray-900">
                                  {application.studentName}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  Applied {formatDate(application.appliedAt)}
                                </p>
                              </div>
                            </div>
                            {application.fitmentScore && (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFitmentColor(application.fitmentScore)}`}>
                                {application.fitmentScore}% {getFitmentText(application.fitmentScore)}
                              </span>
                            )}
                          </div>

                          <div className="space-y-2 text-sm">
                            <div className="flex items-center text-gray-600">
                              <Phone className="w-4 h-4 mr-2" />
                              <span>{application.studentPhone}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <Mail className="w-4 h-4 mr-2" />
                              <span>{application.studentEmail}</span>
                            </div>
                            {application.studentDetails?.education?.degree && (
                              <div className="flex items-center text-gray-600">
                                <GraduationCap className="w-4 h-4 mr-2" />
                                <span>
                                  {application.studentDetails.education.degree}
                                  {application.studentDetails.education.specialization && 
                                    ` in ${application.studentDetails.education.specialization}`
                                  }
                                </span>
                              </div>
                            )}
                            {application.studentDetails?.assessmentScore && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <p className="text-xs font-medium text-gray-700 mb-2">Assessment Scores:</p>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div>Technical: {application.studentDetails.assessmentScore.technical || 'N/A'}</div>
                                  <div>Communication: {application.studentDetails.assessmentScore.communication || 'N/A'}</div>
                                  <div>Problem Solving: {application.studentDetails.assessmentScore.problemSolving || 'N/A'}</div>
                                  <div>Teamwork: {application.studentDetails.assessmentScore.teamwork || 'N/A'}</div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Applications Found</h2>
                <p className="text-gray-600 mb-4">
                  No students have applied for jobs at "{companyName}" yet.
                </p>
                <button
                  onClick={resetSearch}
                  className="btn-primary"
                >
                  Try Another Company
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default CompanyResults
