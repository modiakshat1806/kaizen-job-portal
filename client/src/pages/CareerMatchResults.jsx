import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  Star, TrendingUp, ArrowLeft, Building, MapPin,
  Target, Award, CheckCircle, Briefcase
} from 'lucide-react'
import api from '../services/api'

const CareerMatchResults = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const assessmentData = location.state?.assessmentData

  const [loading, setLoading] = useState(true)
  const [careerMatches, setCareerMatches] = useState([])
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // If no assessment data, redirect to assessment
    if (!assessmentData) {
      navigate('/assessment')
      return
    }

    fetchCareerMatches()
  }, [assessmentData, navigate])

  const fetchCareerMatches = async () => {
    try {
      setLoading(true)

      // Simulate loading progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 500)

      const response = await api.post('/career-matches', { assessmentData })

      clearInterval(progressInterval)
      setProgress(100)

      setTimeout(() => {
        setCareerMatches(response.data.matches || [])
        setLoading(false)
      }, 1000)

    } catch (error) {
      console.error('Error fetching career matches:', error)
      toast.error('Failed to generate career matches. Please try again.')
      setLoading(false)
    }
  }

  const getFitmentClass = (score) => {
    if (score >= 90) return 'text-green-600 bg-green-100'
    if (score >= 80) return 'text-blue-600 bg-blue-100'
    if (score >= 70) return 'text-purple-600 bg-purple-100'
    return 'text-orange-600 bg-orange-100'
  }

  const getFitmentText = (score) => {
    if (score >= 90) return 'Excellent Match'
    if (score >= 80) return 'Great Match'
    if (score >= 70) return 'Good Match'
    return 'Fair Match'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center space-y-8 max-w-md mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Kaizen Job Portal</h1>
            <p className="text-gray-600">Analyzing Your Career Matches</p>
          </div>

          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>

          <div className="space-y-4">
            <p className="text-xl text-gray-700">Taking you a step closer towards a better future...</p>
            <p className="text-lg text-gray-600">Analyzing your unique skills and preferences...</p>
          </div>

          <div className="w-64 bg-gray-200 rounded-full h-2 mx-auto">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>

          <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Career Matches</h1>
          <p className="text-gray-600">Based on your assessment, here are the roles that best fit your profile</p>
        </div>

        {/* Results Grid */}
        {careerMatches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {careerMatches.map((match, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                onClick={() => navigate(`/jobs?role=${encodeURIComponent(match.jobTitle)}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">{match.relevantLogo}</div>
                  <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getFitmentClass(match.fitmentScore)}`}>
                    {match.fitmentScore}%
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">{match.jobTitle}</h3>
                <p className="text-gray-600 mb-4">{match.jobDescription}</p>

                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Why You Match:</h4>
                  <ul className="space-y-1">
                    {match.whyYouMatch.map((reason, reasonIndex) => (
                      <li key={reasonIndex} className="text-sm text-gray-600 flex items-start">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="text-sm font-medium text-gray-700">
                    {getFitmentText(match.fitmentScore)}
                  </span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    View Jobs
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Target className="w-16 h-16 mx-auto" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No matches found</h2>
            <p className="text-gray-600 mb-4">We couldn't generate career matches at this time.</p>
            <button
              onClick={() => navigate('/assessment')}
              className="btn-primary"
            >
              Retake Assessment
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default CareerMatchResults